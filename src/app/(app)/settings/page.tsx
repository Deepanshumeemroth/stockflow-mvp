import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { name: true, defaultLowStockThreshold: true },
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Organization</h2>
        <p className="text-sm text-gray-500 mb-6">{org?.name}</p>

        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Inventory Defaults
        </h3>
        <SettingsForm defaultThreshold={org?.defaultLowStockThreshold ?? 5} />
      </div>
    </div>
  );
}
