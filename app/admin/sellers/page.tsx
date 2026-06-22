'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface SellerInfo {
  id: string;
  userId: string;
  storeName: string;
  status: string;
  verificationStatus: string;
  totalOrders: number;
  rating: number;
  createdAt: string;
  user: {
    email: string;
    name: string;
  };
}

function AdminSellersContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sellers, setSellers] = useState<SellerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user && (session.user as any).role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchSellers();
    }
  }, [session, filter]);

  const fetchSellers = async () => {
    try {
      const res = await fetch(`/api/admin/sellers?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setSellers(data);
      }
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sellerId: string) => {
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (res.ok) {
        fetchSellers();
      }
    } catch (error) {
      console.error('Failed to approve seller:', error);
    }
  };

  const handleReject = async (sellerId: string) => {
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (res.ok) {
        fetchSellers();
      }
    } catch (error) {
      console.error('Failed to reject seller:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div>Loading sellers...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-4xl font-bold text-black mb-2">Seller Management</h1>
      <p className="text-gray-600 mb-8">Approve and manage seller accounts</p>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8 border-b border-black pb-4">
        <button
          onClick={() => setFilter('all')}
          className={`font-medium ${filter === 'all' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
        >
          All Sellers
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`font-medium ${filter === 'pending' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`font-medium ${filter === 'approved' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`font-medium ${filter === 'rejected' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
        >
          Rejected
        </button>
      </div>

      {sellers.length > 0 ? (
        <div className="space-y-4">
          {sellers.map((seller) => (
            <div key={seller.id} className="border border-black bg-white p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-gray-600 text-sm mb-1">Store Name</div>
                  <div className="font-bold text-black">{seller.storeName}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-1">Owner</div>
                  <div className="text-black">{seller.user.name || seller.user.email}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-1">Orders</div>
                  <div className="font-bold text-black">{seller.totalOrders}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-1">Rating</div>
                  <div className="font-bold text-black">{seller.rating.toFixed(1)}/5</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className={`px-3 py-1 border text-sm font-medium ${
                    seller.status === 'APPROVED'
                      ? 'border-green-600 text-green-600'
                      : seller.status === 'REJECTED'
                      ? 'border-red-600 text-red-600'
                      : 'border-yellow-600 text-yellow-600'
                  }`}>
                    {seller.status}
                  </span>
                </div>

                {seller.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(seller.id)}
                      className="px-4 py-2 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(seller.id)}
                      className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-black bg-white p-12 text-center">
          <h3 className="text-xl font-bold mb-2">No sellers found</h3>
        </div>
      )}
    </div>
  );
}

export default function AdminSellers() {
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center"><div>Loading...</div></div>}>
      <AdminSellersContent />
    </Suspense>
  );
}