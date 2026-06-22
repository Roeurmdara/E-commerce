'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
};

type DashboardSidebarShellProps = {
  sectionLabel: string;
  title: string;
  description: string;
  navItems: NavItem[];
  children: React.ReactNode;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardSidebarShell({
  sectionLabel,
  title,
  description,
  navItems,
  children,
}: DashboardSidebarShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
  <div className="mx-auto flex min-h-screen w-full max-w-[1920px] flex-col md:flex-row">
        <aside className="border-b border-black bg-white md:min-h-screen md:w-72 md:border-r md:border-b-0">
          <div className="border-b border-black px-6 py-6">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              {sectionLabel}
            </div>
            <h1 className="mt-3 text-2xl font-bold">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 py-4 md:flex-col md:overflow-visible md:px-4">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap border px-4 py-3 text-sm font-medium transition md:w-full ${
                    active
                      ? 'border-black bg-black text-white'
                      : 'border-transparent text-gray-600 hover:border-black hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
