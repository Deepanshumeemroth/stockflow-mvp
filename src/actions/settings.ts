"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const SettingsSchema = z.object({
  defaultLowStockThreshold: z.coerce
    .number()
    .int()
    .min(0, "Threshold must be 0 or more"),
});

export type SettingsState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

export async function updateSettings(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const raw = { defaultLowStockThreshold: formData.get("defaultLowStockThreshold") };
  const parsed = SettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.organization.update({
    where: { id: session.organizationId },
    data: { defaultLowStockThreshold: parsed.data.defaultLowStockThreshold },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
