"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, ShoppingCart } from "lucide-react"
import { StorefrontNav } from "@/components/storefront-nav"
import { Button } from "@/components/ui/button"
import CurvedLoop from "@/components/CurvedLoop"

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    discountPercent: number
    averageRating: number
    reviewCount: number
    category: { name: string }
    images: Array<{ imageUrl: string; altText?: string }>
  }
}

export default function WishlistPage() {
  const { status } = useSession()
  const router = useRouter()

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/wishlist")
      return
    }

    if (status === "authenticated") {
      fetchWishlist()
    }
  }, [status])

  async function fetchWishlist() {
    try {
      setIsLoading(true)

      const res = await fetch("/api/wishlist")
      if (!res.ok) throw new Error("Failed to fetch wishlist")

      const data = await res.json()
      setWishlistItems(data)
    } catch (err) {
      console.error(err)
      setError("Failed to load wishlist")
    } finally {
      setIsLoading(false)
    }
  }

  async function removeFromWishlist(id: string) {
    setIsRemoving(id)

    try {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed")

      setWishlistItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error(err)
      alert("Failed to remove wishlist item")
    } finally {
      setIsRemoving(null)
    }
  }

  async function addToCart(productId: string) {
    setAddedToCart(productId)

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      })

      if (!res.ok) throw new Error("Failed")

      alert("Added to cart!")
    } catch (err) {
      console.error(err)
      alert("Failed to add to cart")
    } finally {
      setAddedToCart(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <StorefrontNav />
      <section className="bg-black text-white h-[130px] flex items-center overflow-hidden">
  <CurvedLoop 
    marqueeText="This ✦ is ✦ your ✦ wishlist ✦ Page. ✦"
    speed={2}
    curveAmount={100}
    direction="right"
    interactive
    className="custom-text-style"
  />
</section>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-10 pb-2">
     
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {error && (
          <div className="mb-4 text-sm text-red-500 border border-red-300 p-4 rounded-xl">
            {error}
          </div>
        )}

        {isLoading ? (
          <p>Loading...</p>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6 uppercase tracking-widest text-sm">
              Your wishlist is empty
            </p>

            <Button asChild className="bg-black text-white rounded-full px-10 py-3">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {wishlistItems.map((item) => {
              const product = item.product
              const hasDiscount =
                product.discountPercent > 0 && product.originalPrice

              return (
                <div key={item.id} className="flex flex-col bg-white">
                  {/* IMAGE */}
                  <div className="relative overflow-hidden rounded-xl bg-[#f2f2f0] group">
                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="absolute left-3 bottom-3 z-10">
                        <span className="bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                          -{product.discountPercent}%
                        </span>
                      </div>
                    )}

                    {/* Remove Wishlist */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      disabled={isRemoving === item.id}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-black hover:text-white transition"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </button>

                    {/* Product Image */}
                    <Link
                      href={`/products/${product.id}`}
                      className="block aspect-square overflow-hidden"
                    >
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].imageUrl}
                          alt={product.images[0].altText || product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                          No image
                        </div>
                      )}
                    </Link>

                    {/* Add To Cart Hover */}
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={addedToCart === product.id}
                      className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white text-xs font-medium py-2.5 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {addedToCart === product.id
                        ? "Adding..."
                        : "Add to Cart"}
                    </button>
                  </div>

                  {/* INFO */}
                  <div className="pt-3 pb-1 px-0.5">
                    {/* Price + Heart */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold text-black">
                        US ${product.price.toFixed(2)}
                      </span>

                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                          US ${product.originalPrice?.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <Link href={`/products/${product.id}`}>
                      <p className="text-sm text-gray-700 hover:text-black transition-colors line-clamp-1">
                        {product.name}
                      </p>
                    </Link>

                    {/* Category */}
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                      {product.category?.name}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}