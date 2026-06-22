import DashboardSidebarShell from "@/components/dashboard-sidebar-shell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/sellers", label: "Sellers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <DashboardSidebarShell
      sectionLabel="Admin Panel"
      title="Admin"
      description="Manage platform activity, sellers, products, and customer operations from one place."
      navItems={adminNavItems}
    >
      {children}
    </DashboardSidebarShell>
  );
}
