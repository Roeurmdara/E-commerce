"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StorefrontNav } from "@/components/storefront-nav"

interface CartItem {
  id: string
  quantity: number
  size?: string | null
  color?: string | null
  product: {
    id: string
    name: string
    price: number
  }
}

type SellerProductResponse = {
  sellerId: string
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    couponCode: "",
  })

  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/checkout")
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsPlacingOrder(true)

    try {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
        setError("Please fill in all required fields")
        return
      }

      // Create order for each seller
      const sellerOrders = new Map<string, CartItem[]>()

      for (const item of cartItems) {
        // Get product to find seller
        const productRes = await fetch(`/api/products/${item.product.id}`)
        const product: SellerProductResponse = await productRes.json()

        if (!sellerOrders.has(product.sellerId)) {
          sellerOrders.set(product.sellerId, [])
        }
        const sellerItems = sellerOrders.get(product.sellerId)
        if (sellerItems) {
          sellerItems.push(item)
        }
      }

      // Create orders
      for (const [sellerId, items] of sellerOrders) {
        const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        const taxAmount = subtotal * 0.1
        const totalAmount = subtotal + taxAmount

        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
              size: item.size,
              color: item.color,
            })),
            shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
            phoneNumber: formData.phone,
            sellerId,
            subtotal,
            taxAmount,
            totalAmount,
            couponCode: formData.couponCode || undefined,
          }),
        })

        if (!orderRes.ok) {
          const err = await orderRes.json()
          throw new Error(err.error || "Failed to create order")
        }
      }

      // Clear cart
      for (const item of cartItems) {
        await fetch(`/api/cart/${item.id}`, { method: "DELETE" })
      }

      alert("Order placed successfully!")
      router.push("/orders")
    } catch (err: any) {
      setError(err.message || "Failed to place order")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Button asChild className="bg-black text-white px-8 py-2">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-white">
      <StorefrontNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-black mb-8">Checkout</h1>

        {error && (
          <div className="mb-4 p-4 border border-red-500 bg-white text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="border border-black p-6">
                <h2 className="text-xl font-bold text-black mb-4">Shipping Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-black bg-white text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-black bg-white text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-black bg-white text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-black bg-white text-black"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-black bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 border border-black bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Zip Code *</label>
                      <input
                        type="text"
                        required
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className="w-full px-3 py-2 border border-black bg-white text-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="border border-black p-6">
                <h2 className="text-xl font-bold text-black mb-4">Promo Code</h2>
                <input
                  type="text"
                  placeholder="Enter coupon code (optional)"
                  value={formData.couponCode}
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                  className="w-full px-3 py-2 border border-black bg-white text-black"
                />
              </div>

              <Button
                type="submit"
                disabled={isPlacingOrder}
                className="w-full bg-black text-white py-3 font-bold text-lg hover:opacity-80 disabled:opacity-50"
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-black p-6 sticky top-20">
              <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-black max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-medium text-black">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-black">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-black">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-black">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold text-black">Total</span>
                <span className="text-lg font-bold text-black">${total.toFixed(2)}</span>
              </div>

              <p className="text-xs text-gray-500">
                Payment will be processed. (Payments coming soon)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
