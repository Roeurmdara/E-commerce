import DashboardSidebarShell from '@/components/dashboard-sidebar-shell';

const sellerNavItems = [
  { href: '/seller/dashboard', label: 'Overview' },
  { href: '/seller/products', label: 'Products' },
  { href: '/seller/orders', label: 'Orders' },
  { href: '/seller/analytics', label: 'Analytics' },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardSidebarShell
      sectionLabel="Seller Workspace"
      title="Seller"
      description="Manage your catalog, process incoming orders, and track store performance."
      navItems={sellerNavItems}
    >
      {children}
    </DashboardSidebarShell>
  );
}
