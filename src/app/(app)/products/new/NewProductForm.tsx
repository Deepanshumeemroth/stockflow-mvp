"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { createProduct } from "@/actions/products";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";

export default function NewProductPage() {
  const [state, action] = useFormState(createProduct, {});

  return (
    <div className="max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/products" className="text-sm text-gray-500 hover:text-gray-700">
          ← Products
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">New Product</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form action={action} className="flex flex-col gap-4">
          <FormField
            label="Product Name"
            name="name"
            placeholder="e.g. Blue Widget"
            required
            errors={state.fieldErrors?.name}
          />
          <FormField
            label="SKU"
            name="sku"
            placeholder="e.g. BW-001"
            required
            errors={state.fieldErrors?.sku}
          />
          <FormField
            label="Quantity on Hand"
            name="quantityOnHand"
            type="number"
            defaultValue={0}
            min="0"
            required
            errors={state.fieldErrors?.quantityOnHand}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Cost Price ($)"
              name="costPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              errors={state.fieldErrors?.costPrice}
            />
            <FormField
              label="Selling Price ($)"
              name="sellingPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              errors={state.fieldErrors?.sellingPrice}
            />
          </div>
          <FormField
            label="Low Stock Threshold (optional)"
            name="lowStockThreshold"
            type="number"
            min="0"
            placeholder="Leave blank to use org default"
            errors={state.fieldErrors?.lowStockThreshold}
          />

          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
            <SubmitButton label="Create Product" loadingLabel="Creating..." />
            <Link
              href="/products"
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
