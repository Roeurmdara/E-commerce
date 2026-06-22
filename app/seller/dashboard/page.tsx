"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  recentOrders: any[];
}

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchSellerStats();
    }
  }, [session]);

  const fetchSellerStats = async () => {
    try {
      const res = await fetch("/api/seller/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-medium">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">Seller Dashboard</h1>
        <p className="text-gray-600">Manage your products, orders, and store</p>
      </div>

      {/* Stats Grid */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Total Products</div>
            <div className="text-3xl font-bold text-black">
              {stats.totalProducts}
            </div>
          </div>
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Total Orders</div>
            <div className="text-3xl font-bold text-black">
              {stats.totalOrders}
            </div>
          </div>
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-black">
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </div>
          <div className="border border-black bg-white p-6">
            <div className="text-gray-600 text-sm mb-2">Average Rating</div>
            <div className="text-3xl font-bold text-black">
              {stats.averageRating.toFixed(1)}/5
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/seller/products/new"
          className="border-2 border-black bg-white p-6 hover:bg-black hover:text-white transition"
        >
          <h3 className="text-xl font-bold mb-2">Add New Product</h3>
          <p className="text-gray-600 hover:text-gray-300">
            Create and list a new product in your store
          </p>
        </Link>
        <Link
          href="/seller/orders"
          className="border-2 border-black bg-white p-6 hover:bg-black hover:text-white transition"
        >
          <h3 className="text-xl font-bold mb-2">View Orders</h3>
          <p className="text-gray-600 hover:text-gray-300">
            Manage orders and update shipping status
          </p>
        </Link>
      </div>

      {/* Recent Orders */}
      {stats?.recentOrders && stats.recentOrders.length > 0 ? (
        <div className="border border-black bg-white p-6">
          <h2 className="text-2xl font-bold text-black mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-black">
                <tr>
                  <th className="text-left py-3 font-bold">Order ID</th>
                  <th className="text-left py-3 font-bold">Customer</th>
                  <th className="text-left py-3 font-bold">Amount</th>
                  <th className="text-left py-3 font-bold">Status</th>
                  <th className="text-left py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-gray-200">
                    <td className="py-3 font-mono text-sm">
                      {order.orderNumber}
                    </td>
                    <td className="py-3">{order.customer.name}</td>
                    <td className="py-3 font-bold">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span className="px-3 py-1 border border-black text-sm font-medium">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
