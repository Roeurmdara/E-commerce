"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trash2, RefreshCw, ShieldCheck } from "lucide-react"
import { StorefrontNav } from "@/components/storefront-nav"
import CurvedLoop from "@/components/CurvedLoop"

interface CartItem {
  id: string
  quantity: number
  size?: string
  color?: string
  product: {
    id: string
    name: string
    price: number
    stock: number
    images: Array<{ imageUrl: string; altText?: string }>
  }
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [voucher, setVoucher] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/cart")
      return
    }
    if (status === "authenticated") {
      fetchCart()
    }
  }, [status])

  async function fetchCart() {
    try {
      setIsLoading(true)
      const response = await fetch("/api/cart")
      if (!response.ok) throw new Error("Failed to fetch cart")
      const data = await response.json()
      setCartItems(data)
    } catch (err) {
      setError("Failed to load cart")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function updateQuantity(id: string, quantity: number) {
    if (quantity < 1) {
      removeItem(id)
      return
    }
    setIsUpdating(id)
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to update cart")
      setCartItems((prev) => prev.map((item) => (item.id === id ? data : item)))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsUpdating(null)
    }
  }

  async function removeItem(id: string) {
    setIsUpdating(id)
    try {
      const response = await fetch(`/api/cart/${id}`, { method: "DELETE" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to delete item")
      setCartItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsUpdating(null)
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const tax = subtotal * 0.1
  const deliveryFee = 50
  const total = subtotal - tax + deliveryFee

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading cart...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <StorefrontNav />
      <section className="bg-black text-white h-[130px] flex items-center overflow-hidden">
  <CurvedLoop 
    marqueeText="Make ✦ this  ✦ order ✦ and ✦ Pay.. ✦"
    speed={2}
    curveAmount={100}
    direction="right"
    interactive
    className="custom-text-style"
  />
</section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    

        {error && (
          <div className="mb-6 px-4 py-3 border border-red-300 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6 text-sm">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-2.5 bg-black text-white text-sm font-medium  hover:opacity-80 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-[1fr_140px_100px_56px] gap-4 px-5 py-2.5 border border-gray-100 rounded-xl bg-gray-50">
                <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">
                  Product
                </span>
                <span className="text-xs uppercase tracking-widest text-gray-400 font-medium text-center">
                  Quantity
                </span>
                <span className="text-xs uppercase tracking-widest text-gray-400 font-medium text-right">
                  Total
                </span>
                <span className="text-xs uppercase tracking-widest text-gray-400 font-medium text-center">
                  Action
                </span>
              </div>

              {/* Items */}
              <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_140px_100px_56px] gap-4 items-center px-5 py-4"
                  >
                    {/* Product Info */}
                    <div className="flex gap-3 items-center">
                      <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0].imageUrl}
                            alt={item.product.images[0].altText || item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/products/${item.product.id}`}
                          className="font-medium text-black text-sm hover:underline leading-snug"
                        >
                          {item.product.name}
                        </Link>
                        {(item.size || item.color) && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                    {item.size && <span>Size {item.size}</span>}
                  
                    {item.color && (
                      <span
                        className="w-3 h-3 rounded-full "
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                  </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          ${item.product.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={isUpdating === item.id}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors text-base leading-none"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isUpdating === item.id || item.quantity >= item.product.stock}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors text-base leading-none"
                      >
                        +
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <span className="text-sm font-semibold text-black">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Remove */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isUpdating === item.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Update Cart */}
              <button
                onClick={fetchCart}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium  hover:opacity-80 transition-opacity"
              >
                <RefreshCw size={13} />
                Update Cart
              </button>

              {/* Craft Banner */}
              <div className="mt-6 flex items-center justify-between px-6 py-5 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Build custom furniture</p>
                  <p className="text-lg font-semibold text-black">Craft Own Furniture</p>
                </div>
                <button className="px-5 py-2.5 bg-black text-white text-sm font-medium  hover:opacity-80 transition-opacity whitespace-nowrap">
                  Lets Talk!
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-gray-100 rounded-xl p-6 sticky top-6">
                <h2 className="text-base font-semibold text-black mb-4">
                  Order Summary
                </h2>

                {/* Voucher */}
                <div className="flex gap-2 mb-5">
                  <input
                    type="text"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                    placeholder="Discount voucher"
                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-black placeholder:text-gray-400 outline-none focus:border-gray-400 transition-colors"
                  />
                  <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-black hover:bg-gray-100 transition-colors">
                    Apply
                  </button>
                </div>

                {/* Lines */}
                <div className="space-y-2.5 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Sub Total</span>
                    <span className="text-sm font-medium text-black">
                      {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Discount (10%)</span>
                    <span className="text-sm font-medium text-green-600">
                      −{tax.toLocaleString("en-US", { minimumFractionDigits: 3 })} USD
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Delivery fee</span>
                    <span className="text-sm font-medium text-black">
                      {deliveryFee.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-black">Total</span>
                    <span className="text-xl font-semibold text-black">
                      ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                </div>

                {/* Checkout */}
                <Link
                  href="/checkout"
                  className="block w-full text-center py-3 bg-black text-white text-sm font-medium  hover:opacity-80 transition-opacity mb-4"
                >
                  Checkout Now
                </Link>

                {/* Warranty */}
                <div className="flex gap-2 items-start">
                  <ShieldCheck size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    90 Day Limited Warranty against manufacturer's defects.{" "}
                    <a href="#" className="text-blue-500 hover:underline">
                      Details
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}