'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Mail,
  Package,
  Search,
  Truck,
  User,
} from 'lucide-react';

interface ProductImage {
  imageUrl: string;
  altText?: string | null;
}

interface OrderItem {
  id?: string;
  name?: string;
  quantity: number;
  price: number;
  size?: string | null;
  color?: string | null;
  product?: {
    id: string;
    name: string;
    images: ProductImage[];
    price: number;
  };
}

interface SellerOrder {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  customer?: { name: string | null; email: string | null };
  totalAmount: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'border-amber-300 bg-amber-50 text-amber-800' },
  CONFIRMED: { label: 'Confirmed', className: 'border-blue-300 bg-blue-50 text-blue-800' },
  PROCESSING: { label: 'Processing', className: 'border-purple-300 bg-purple-50 text-purple-800' },
  SHIPPED: { label: 'Shipped', className: 'border-indigo-300 bg-indigo-50 text-indigo-800' },
  DELIVERED: { label: 'Delivered', className: 'border-green-300 bg-green-50 text-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'border-red-300 bg-red-50 text-red-800' },
  REFUNDED: { label: 'Refunded', className: 'border-gray-300 bg-gray-100 text-gray-800' },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'border-gray-300 bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center border px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

function ProductThumb({ item }: { item: OrderItem }) {
  const image = item.product?.images?.[0];
  const productName = item.product?.name ?? item.name ?? 'Product';

  if (!image?.imageUrl) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-black bg-gray-50 text-gray-500">
        <Package className="h-5 w-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={image.imageUrl}
      alt={image.altText || productName}
      className="h-16 w-16 shrink-0 border border-black object-cover"
    />
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-black bg-white p-4">
      <div className="mb-3 flex h-8 w-8 items-center justify-center bg-black text-white">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-black">{value}</div>
    </div>
  );
}

export default function SellerOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      setError('');
      const res = await fetch('/api/seller/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      setOrders(await res.json());
    } catch (e) {
      setError('Failed to load orders. Please try again.');
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setError('');

    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update order');

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
    } catch (e) {
      setError('Could not update the order status.');
      console.error('Failed to update order:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) => {
      const customerName = order.customer?.name ?? order.customerName ?? '';
      const customerEmail = order.customer?.email ?? '';

      return (
        order.orderNumber.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        customerEmail.toLowerCase().includes(query) ||
        order.items.some((item) => (item.product?.name ?? item.name ?? '').toLowerCase().includes(query))
      );
    });
  }, [orders, search]);

  const summary = useMemo(() => {
    const openOrders = orders.filter((order) => !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)).length;
    const totalItems = orders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return { openOrders, totalItems, revenue };
  }, [orders]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <span className="text-sm text-gray-500">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Seller orders</div>
          <h1 className="mt-2 text-4xl font-bold text-black">Manage Orders</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Review customer purchases, see the product images in each order, and move orders through fulfillment.
          </p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, customer, product"
            className="h-11 w-full border border-black bg-white pl-10 pr-3 text-sm text-black outline-none focus:ring-2 focus:ring-black/20"
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric icon={Package} label="Total Orders" value={String(orders.length)} />
        <Metric icon={Clock3} label="Open Orders" value={String(summary.openOrders)} />
        <Metric icon={DollarSign} label="Revenue" value={`$${summary.revenue.toFixed(2)}`} />
      </div>

      {error && (
        <div className="mb-4 border border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const customerDisplay = order.customer?.name ?? order.customerName ?? 'Customer';
            const customerEmail = order.customer?.email;
            const isUpdating = updatingId === order.id;
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <article key={order.id} className="border border-black bg-white">
                <div className="grid gap-4 border-b border-black bg-white p-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-mono text-sm font-bold text-black">{order.orderNumber}</h2>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-black" aria-hidden="true" />
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-black" aria-hidden="true" />
                        <span className="truncate">{customerDisplay}</span>
                      </div>
                      {customerEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-black" aria-hidden="true" />
                          <span className="truncate">{customerEmail}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-black" aria-hidden="true" />
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:items-end">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Total</div>
                    <div className="text-2xl font-bold text-black">${order.totalAmount.toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 xl:grid-cols-[1fr_260px]">
                  <div>
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Products
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {order.items.map((item, index) => {
                        const productName = item.product?.name ?? item.name ?? 'Product';
                        const lineTotal = item.price * item.quantity;

                        return (
                          <div key={item.id ?? `${order.id}-${index}`} className="flex gap-3 border border-gray-200 p-3">
                            <ProductThumb item={item} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-black">{productName}</div>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                <span className="border border-gray-300 px-2 py-1">Qty {item.quantity}</span>
                                {item.size && <span className="border border-gray-300 px-2 py-1">Size {item.size}</span>}
                                {item.color && <span className="border border-gray-300 px-2 py-1">Color {item.color}</span>}
                              </div>
                              <div className="mt-3 text-sm font-bold text-black">${lineTotal.toFixed(2)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border border-black bg-gray-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-black">
                      <Truck className="h-4 w-4" aria-hidden="true" />
                      Fulfillment
                    </div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Change status
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        disabled={isUpdating}
                        onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                        className="h-10 w-full border border-black bg-white px-3 text-sm font-semibold text-black outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:ring-2 focus:ring-black/20"
                      >
                        {ORDER_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {STATUS_CONFIG[value]?.label ?? value}
                          </option>
                        ))}
                      </select>
                      {isUpdating ? (
                        <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="border-2 border-dashed border-black bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-black text-white">
            <Package className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-black">
            {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            {orders.length === 0
              ? 'Customer orders will appear here after they buy your products.'
              : 'Try searching by another order number, customer, or product name.'}
          </p>
        </div>
      )}
    </div>
  );
}
