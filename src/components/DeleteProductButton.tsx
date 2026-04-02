"use client";

import { deleteProduct } from "@/actions/products";

export default function DeleteProductButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await deleteProduct(id);
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-600 hover:text-red-800 transition-colors"
    >
      Delete
    </button>
  );
}
