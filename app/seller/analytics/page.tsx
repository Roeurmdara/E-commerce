'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AnalyticsData {
  totalRevenue: number;
  totalSales: number;
  totalOrders: number;
  conversionRate: number;
  avgOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  monthlySales: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export default function SellerAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchAnalytics();
    }
  }, [session]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/seller/analytics');
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
          <h1 className="text-4xl font-bold text-black mb-4">Analytics</h1>
          <div className="border-2 border-dashed border-black bg-white p-12 text-center">
            <h3 className="text-xl font-bold mb-2">No data available</h3>
            <p className="text-gray-600">Analytics will appear once you have orders</p>
          </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
        <h1 className="text-4xl font-bold text-black mb-8">Analytics</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-black">
              ${analytics.totalRevenue.toFixed(2)}
            </div>
          </div>
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Total Orders</div>
            <div className="text-3xl font-bold text-black">{analytics.totalOrders}</div>
          </div>
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Avg Order Value</div>
            <div className="text-3xl font-bold text-black">
              ${analytics.avgOrderValue.toFixed(2)}
            </div>
          </div>
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Conversion Rate</div>
            <div className="text-3xl font-bold text-black">{analytics.conversionRate.toFixed(1)}%</div>
          </div>
        </div>

        {/* Top Products */}
        {analytics.topProducts.length > 0 && (
          <div className="border border-black bg-white p-6 mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">Top Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-black">
                  <tr>
                    <th className="text-left py-3 font-bold">Product Name</th>
                    <th className="text-left py-3 font-bold">Units Sold</th>
                    <th className="text-left py-3 font-bold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProducts.map((product, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3">{product.name}</td>
                      <td className="py-3 font-bold">{product.sales}</td>
                      <td className="py-3 font-bold text-black">
                        ${product.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Monthly Sales */}
        {analytics.monthlySales.length > 0 && (
          <div className="border border-black bg-white p-6">
            <h2 className="text-2xl font-bold text-black mb-4">Monthly Sales</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-black">
                  <tr>
                    <th className="text-left py-3 font-bold">Month</th>
                    <th className="text-left py-3 font-bold">Orders</th>
                    <th className="text-left py-3 font-bold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.monthlySales.map((month, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3">{month.month}</td>
                      <td className="py-3 font-bold">{month.orders}</td>
                      <td className="py-3 font-bold text-black">
                        ${month.revenue.toFixed(2)}
                      </td>
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
