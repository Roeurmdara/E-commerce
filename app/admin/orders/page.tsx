'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  seller: {
    storeName: string;
  };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function AdminOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
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
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div>Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
        <h1 className="text-4xl font-bold text-black mb-2">Order Management</h1>
        <p className="text-gray-600 mb-8">Monitor all platform orders</p>

        {orders.length > 0 ? (
          <div className="border border-black bg-white overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f5f5] border-b border-black">
                <tr>
                  <th className="text-left px-6 py-4 font-bold">Order ID</th>
                  <th className="text-left px-6 py-4 font-bold">Customer</th>
                  <th className="text-left px-6 py-4 font-bold">Seller</th>
                  <th className="text-left px-6 py-4 font-bold">Amount</th>
                  <th className="text-left px-6 py-4 font-bold">Status</th>
                  <th className="text-left px-6 py-4 font-bold">Payment</th>
                  <th className="text-left px-6 py-4 font-bold">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-[#f5f5f5]">
                    <td className="px-6 py-4 font-mono text-sm">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-gray-600">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{order.seller.storeName}</td>
                    <td className="px-6 py-4 font-bold">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 border text-sm font-medium ${
                        order.status === 'DELIVERED'
                          ? 'border-green-600 text-green-600'
                          : order.status === 'CANCELLED'
                          ? 'border-red-600 text-red-600'
                          : 'border-black text-black'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 border text-sm font-medium ${
                        order.paymentStatus === 'completed'
                          ? 'border-green-600 text-green-600'
                          : 'border-yellow-600 text-yellow-600'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-2 border-dashed border-black bg-white p-12 text-center">
            <h3 className="text-xl font-bold mb-2">No orders found</h3>
          </div>
        )}
    </div>
  );
}
