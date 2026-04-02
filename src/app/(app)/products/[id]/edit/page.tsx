import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditProductForm from "./EditProductForm";

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const product = await prisma.product.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
  });

  if (!product) notFound();

  return (
    <EditProductForm
      product={{
        id: product.id,
        name: product.name,
        sku: product.sku,
        quantityOnHand: product.quantityOnHand,
        costPrice: product.costPrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        lowStockThreshold: product.lowStockThreshold,
      }}
    />
  );
}
