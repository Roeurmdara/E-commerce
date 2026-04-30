'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SellerProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  reviewCount: number;
  averageRating: number;
  createdAt: string;
}

export default function SellerProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProducts();
    }
  }, [session]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/seller/products');
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

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">My Products</h1>
            <p className="text-gray-600">Manage your product listings</p>
          </div>
          <Link
            href="/seller/products/new"
            className="bg-black text-white px-6 py-3 border border-black font-medium hover:bg-white hover:text-black transition"
          >
            + Add Product
          </Link>
        </div>

        {/* Products Table */}
        {products.length > 0 ? (
          <div className="border border-black bg-white overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f5f5] border-b border-black">
                <tr>
                  <th className="text-left px-6 py-4 font-bold">Product Name</th>
                  <th className="text-left px-6 py-4 font-bold">SKU</th>
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
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{product.sku}</td>
                    <td className="px-6 py-4 font-bold">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{product.stock} units</td>
                    <td className="px-6 py-4">
                      {product.averageRating > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{product.averageRating.toFixed(1)}</span>
                          <span className="text-gray-600">({product.reviewCount})</span>
                        </div>
                      ) : (
                        <span className="text-gray-600">No reviews</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 border text-sm font-medium ${
                          product.isActive
                            ? 'border-black text-black'
                            : 'border-gray-300 text-gray-400'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Link
                        href={`/seller/products/${product.id}/edit`}
                        className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-2 border-dashed border-black bg-white p-12 text-center">
            <h3 className="text-xl font-bold mb-2">No products yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first product</p>
            <Link
              href="/seller/products/new"
              className="inline-block bg-black text-white px-6 py-3 border border-black font-medium hover:bg-white hover:text-black transition"
            >
              + Add Product
            </Link>
          </div>
        )}
    </div>
  );
}
