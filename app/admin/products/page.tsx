'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  seller: {
    storeName: string;
  };
  reviewCount: number;
  averageRating: number;
}

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
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
      fetchProducts();
    }
  }, [session]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable' }),
      });

      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to disable product:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div>Loading products...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
        <h1 className="text-4xl font-bold text-black mb-2">Product Moderation</h1>
        <p className="text-gray-600 mb-8">Review and moderate all products</p>

        {products.length > 0 ? (
          <div className="border border-black bg-white overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f5f5] border-b border-black">
                <tr>
                  <th className="text-left px-6 py-4 font-bold">Product Name</th>
                  <th className="text-left px-6 py-4 font-bold">Seller</th>
                  <th className="text-left px-6 py-4 font-bold">Price</th>
                  <th className="text-left px-6 py-4 font-bold">Stock</th>
                  <th className="text-left px-6 py-4 font-bold">Rating</th>
                  <th className="text-left px-6 py-4 font-bold">Status</th>
                  <th className="text-left px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-200 hover:bg-[#f5f5f5]">
                    <td className="px-6 py-4 font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-sm">{product.seller.storeName}</td>
                    <td className="px-6 py-4 font-bold">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      {product.averageRating > 0 ? (
                        <span>{product.averageRating.toFixed(1)}/5</span>
                      ) : (
                        <span className="text-gray-400">No reviews</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 border text-sm font-medium ${
                        product.isActive
                          ? 'border-green-600 text-green-600'
                          : 'border-red-600 text-red-600'
                      }`}>
                        {product.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.isActive && (
                        <button
                          onClick={() => handleDisable(product.id)}
                          className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition text-sm"
                        >
                          Disable
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-2 border-dashed border-black bg-white p-12 text-center">
            <h3 className="text-xl font-bold mb-2">No products found</h3>
          </div>
        )}
    </div>
  );
}
