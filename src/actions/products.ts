"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  quantityOnHand: z.coerce.number().int().min(0, "Quantity must be 0 or more"),
  costPrice: z.coerce.number().min(0, "Cost price must be 0 or more"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be 0 or more"),
  lowStockThreshold: z.coerce.number().int().min(0).optional().nullable(),
});

export type ProductState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function createProduct(
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  const session = await requireSession();

  const raw = {
    name: formData.get("name"),
    sku: formData.get("sku"),
    quantityOnHand: formData.get("quantityOnHand"),
    costPrice: formData.get("costPrice"),
    sellingPrice: formData.get("sellingPrice"),
    lowStockThreshold: formData.get("lowStockThreshold") || null,
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  try {
    await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        quantityOnHand: data.quantityOnHand,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        lowStockThreshold: data.lowStockThreshold ?? null,
        organizationId: session.organizationId,
      },
    });
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return { error: "A product with this SKU already exists." };
    }
    return { error: "Failed to create product. Please try again." };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(
  id: string,
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  const session = await requireSession();

  const raw = {
    name: formData.get("name"),
    sku: formData.get("sku"),
    quantityOnHand: formData.get("quantityOnHand"),
    costPrice: formData.get("costPrice"),
    sellingPrice: formData.get("sellingPrice"),
    lowStockThreshold: formData.get("lowStockThreshold") || null,
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  // Verify ownership before update
  const existing = await prisma.product.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!existing) return { error: "Product not found." };

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        quantityOnHand: data.quantityOnHand,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        lowStockThreshold: data.lowStockThreshold ?? null,
      },
    });
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return { error: "A product with this SKU already exists." };
    }
    return { error: "Failed to update product. Please try again." };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProduct(id: string): Promise<void> {
  const session = await requireSession();

  // Verify ownership before delete
  const existing = await prisma.product.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!existing) return;

  await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
  revalidatePath("/dashboard");
}
