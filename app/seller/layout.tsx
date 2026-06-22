import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardSidebarShell from "@/components/dashboard-sidebar-shell";

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description: "Manage your catalog, orders, and store performance.",
};

interface NavItem {
  href: string;
  label: string;
}

const SELLER_NAV_ITEMS: NavItem[] = [
  { href: "/seller/dashboard", label: "Overview" },
  { href: "/seller/products", label: "Products" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/analytics", label: "Analytics" },
];

const ALLOWED_ROLES = ["SELLER", "ADMIN"] as const;

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/seller/dashboard");
  }

  if (!ALLOWED_ROLES.includes(session.user.role as (typeof ALLOWED_ROLES)[number])) {
    redirect("/");
  }

  return (
    <DashboardSidebarShell
      sectionLabel="Seller Workspace"
      title="Seller"
      description="Manage your catalog, process incoming orders, and track store performance."
      navItems={SELLER_NAV_ITEMS}
    >
      {children}
    </DashboardSidebarShell>
  );
}