import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { name: true, defaultLowStockThreshold: true },
  });

  const products = await prisma.product.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { name: "asc" },
  });

  const defaultThreshold = org?.defaultLowStockThreshold ?? 5;

  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantityOnHand, 0);

  const lowStockItems = products.filter((p) => {
    const threshold = p.lowStockThreshold ?? defaultThreshold;
    return p.quantityOnHand <= threshold;
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{org?.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-medium">Total Products</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-medium">Total Quantity on Hand</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalQuantity}</p>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Low Stock Items</h2>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
            {lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            All products are sufficiently stocked 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">SKU</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-600">Qty on Hand</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-600">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((product) => {
                  const threshold = product.lowStockThreshold ?? defaultThreshold;
                  return (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-3 text-gray-500">{product.sku}</td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-red-600 font-semibold">{product.quantityOnHand}</span>
                      </td>
                      <td className="px-6 py-3 text-right text-gray-500">{threshold}</td>
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
