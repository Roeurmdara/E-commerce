import DashboardSidebarShell from '@/components/dashboard-sidebar-shell';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/sellers', label: 'Sellers' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/analytics', label: 'Analytics' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
