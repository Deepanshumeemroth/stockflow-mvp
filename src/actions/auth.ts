"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken, createSessionCookie, clearSessionCookie } from "@/lib/auth";

const SignupSchema = z.object({
  orgName: z.string().min(2, "Organization name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function signup(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    orgName: formData.get("orgName"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { orgName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const org = await prisma.organization.create({
    data: {
      name: orgName,
      users: {
        create: { email, passwordHash },
      },
    },
    include: { users: true },
  });

  const user = org.users[0];
  const token = await signToken({
    userId: user.id,
    organizationId: org.id,
    email: user.email,
  });

  cookies().set(createSessionCookie(token));
  redirect("/dashboard");
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  const token = await signToken({
    userId: user.id,
    organizationId: user.organizationId,
    email: user.email,
  });

  cookies().set(createSessionCookie(token));
  redirect("/dashboard");
}

export async function logout() {
  cookies().set(clearSessionCookie());
  redirect("/login");
}
