'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PlatformAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  avgOrderValue: number;
  topSellers: Array<{
    storeName: string;
    revenue: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
  }>;
}

export default function AdminAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user && (session.user as any).role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchAnalytics();
    }
  }, [session]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div>Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-6xl">
          <h1 className="text-4xl font-bold text-black mb-4">Platform Analytics</h1>
          <div className="border-2 border-dashed border-black bg-white p-12 text-center">
            <p className="text-gray-600">No data available yet</p>
          </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
        <h1 className="text-4xl font-bold text-black mb-8">Platform Analytics</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="border border-black bg-white p-4">
            <div className="text-gray-600 text-xs mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-black">
              ${analytics.totalRevenue.toFixed(0)}
            </div>
          </div>
          <div className="border border-black bg-white p-4">
            <div className="text-gray-600 text-xs mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-black">{analytics.totalOrders}</div>
          </div>
          <div className="border border-black bg-white p-4">
            <div className="text-gray-600 text-xs mb-1">Avg Order Value</div>
            <div className="text-2xl font-bold text-black">
              ${analytics.avgOrderValue.toFixed(2)}
            </div>
          </div>
          <div className="border border-black bg-white p-4">
            <div className="text-gray-600 text-xs mb-1">Total Users</div>
            <div className="text-2xl font-bold text-black">{analytics.totalUsers}</div>
          </div>
          <div className="border border-black bg-white p-4">
            <div className="text-gray-600 text-xs mb-1">Total Sellers</div>
            <div className="text-2xl font-bold text-black">{analytics.totalSellers}</div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-black bg-white p-4">
            <div className="text-gray-600 text-xs mb-1">Total Products</div>
            <div className="text-3xl font-bold text-black">{analytics.totalProducts}</div>
          </div>
          <div className="border border-black bg-white p-4">
            <div className="text-gray-600 text-xs mb-1">Seller Count</div>
            <div className="text-3xl font-bold text-black">{analytics.totalSellers}</div>
          </div>
        </div>

        {/* Top Sellers */}
        {analytics.topSellers.length > 0 && (
          <div className="border border-black bg-white p-6 mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">Top Sellers</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-black">
                  <tr>
                    <th className="text-left py-3 font-bold">Store Name</th>
                    <th className="text-left py-3 font-bold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topSellers.map((seller, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3">{seller.storeName}</td>
                      <td className="py-3 font-bold text-black">
                        ${seller.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Products */}
        {analytics.topProducts.length > 0 && (
          <div className="border border-black bg-white p-6">
            <h2 className="text-2xl font-bold text-black mb-4">Top Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-black">
                  <tr>
                    <th className="text-left py-3 font-bold">Product Name</th>
                    <th className="text-left py-3 font-bold">Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProducts.map((product, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3">{product.name}</td>
                      <td className="py-3 font-bold text-black">{product.sales}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
