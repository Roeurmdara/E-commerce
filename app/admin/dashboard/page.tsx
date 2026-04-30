'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingSellers: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user && (session.user as any).role !== 'ADMIN') {
      router.push('/admin/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage platform, users, and sellers</p>
      </div>

      {/* Stats Grid */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Total Users</div>
            <div className="text-3xl font-bold text-black">{stats.totalUsers}</div>
          </div>
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Total Sellers</div>
            <div className="text-3xl font-bold text-black">{stats.totalSellers}</div>
          </div>
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Pending Sellers</div>
            <div className="text-3xl font-bold text-black text-red-600">{stats.pendingSellers}</div>
          </div>
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Total Products</div>
            <div className="text-3xl font-bold text-black">{stats.totalProducts}</div>
          </div>
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Total Orders</div>
            <div className="text-3xl font-bold text-black">{stats.totalOrders}</div>
          </div>
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-black">${stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/sellers?filter=pending" className="border-2 border-black bg-white p-6 hover:bg-black hover:text-white transition">
          <h3 className="text-xl font-bold mb-2">Approve Sellers</h3>
          <p className="text-gray-600 hover:text-gray-300">
            {stats?.pendingSellers || 0} pending seller approvals
          </p>
        </Link>
        <Link href="/admin/products" className="border-2 border-black bg-white p-6 hover:bg-black hover:text-white transition">
          <h3 className="text-xl font-bold mb-2">Manage Products</h3>
          <p className="text-gray-600 hover:text-gray-300">Review and moderate all products</p>
        </Link>
        <Link href="/admin/orders" className="border-2 border-black bg-white p-6 hover:bg-black hover:text-white transition">
          <h3 className="text-xl font-bold mb-2">View Orders</h3>
          <p className="text-gray-600 hover:text-gray-300">Monitor all platform orders</p>
        </Link>
      </div>
    </div>
  );
}
