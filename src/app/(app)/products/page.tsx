import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DeleteProductButton from "@/components/DeleteProductButton";

interface ProductsPageProps {
  searchParams: { q?: string };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { defaultLowStockThreshold: true },
  });

  const defaultThreshold = org?.defaultLowStockThreshold ?? 5;
  const query = searchParams.q?.toLowerCase() ?? "";

  const products = await prisma.product.findMany({
    where: {
      organizationId: session.organizationId,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { sku: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/products/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Search Filter */}
      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search by name or SKU..."
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
        >
          Search
        </button>
        {searchParams.q && (
          <Link
            href="/products"
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            {searchParams.q
              ? `No products found for "${searchParams.q}"`
              : "No products yet. Add your first product!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">SKU</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-600">Quantity</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Stock Status</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-600">Selling Price</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const threshold = product.lowStockThreshold ?? defaultThreshold;
                  const isLow = product.quantityOnHand <= threshold;
                  return (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-3 text-gray-500 font-mono text-xs">{product.sku}</td>
                      <td className="px-6 py-3 text-right text-gray-900">{product.quantityOnHand}</td>
                      <td className="px-6 py-3">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                            ⚠ Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            ✓ In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-900">
                        ${Number(product.sellingPrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/products/${product.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            Edit
                          </Link>
                          <DeleteProductButton id={product.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
