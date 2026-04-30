'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Heart, ShoppingCart } from 'lucide-react'

export type ProductCardItem = {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  discountPercent?: number
  stock: number
  colors?: string | null
  averageRating?: number
  reviewCount?: number
  badge?: string | null
  images: Array<{ imageUrl: string; altText?: string | null }>
  category?: { name: string } | null
}

type WishlistItem = {
  id: string
  product: { id: string }
}

function parseColors(value?: string | null) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((e) => typeof e === 'string') : []
  } catch {
    return []
  }
}

function getBadgeUI(badge?: string | null) {
  switch (badge) {
    case 'BEST_SELLER':
      return <span className="bg-black text-white text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wide">Best Seller</span>
    case 'NEW_ARRIVAL':
      return <span className="bg-black text-white text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wide">New Arrival</span>
    case 'SALE':
      return <span className="bg-black text-white text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wide">Sale</span>
    default:
      return null
  }
}

export default function ProductCardList({
  products,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5',
}: {
  products: ProductCardItem[]
  className?: string
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [wishlistMap, setWishlistMap] = useState<Record<string, string>>({})
  const [actingProductId, setActingProductId] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') { setWishlistMap({}); return }
    let cancelled = false
    async function fetchWishlist() {
      try {
        const res = await fetch('/api/wishlist')
        if (!res.ok || cancelled) return
        const data = (await res.json()) as WishlistItem[]
        if (cancelled) return
        setWishlistMap(
          data.reduce<Record<string, string>>((acc, item) => {
            if (item?.product?.id) acc[item.product.id] = item.id
            return acc
          }, {})
        )
      } catch (e) { console.error(e) }
    }
    fetchWishlist()
    return () => { cancelled = true }
  }, [status])

  const wishlistProductIds = useMemo(() => new Set(Object.keys(wishlistMap)), [wishlistMap])

  async function refreshWishlistState() {
    if (status !== 'authenticated') return
    try {
      const res = await fetch('/api/wishlist')
      if (!res.ok) return
      const data = (await res.json()) as WishlistItem[]
      setWishlistMap(
        data.reduce<Record<string, string>>((acc, item) => {
          if (item?.product?.id) acc[item.product.id] = item.id
          return acc
        }, {})
      )
    } catch (e) { console.error(e) }
  }

  async function toggleWishlist(productId: string) {
    if (!session) { router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/products')}`); return }
    const wishlistItemId = wishlistMap[productId]
    setActingProductId(productId)
    try {
      if (wishlistItemId) {
        const res = await fetch(`/api/wishlist/${wishlistItemId}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to remove')
        setWishlistMap((prev) => { const next = { ...prev }; delete next[productId]; return next })
        return
      }
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (!res.ok && res.status !== 409) throw new Error('Failed to add')
      if (res.status === 409) { await refreshWishlistState(); return }
      const data = await res.json()
      setWishlistMap((prev) => ({ ...prev, [productId]: data.id }))
    } catch (e) { console.error(e); alert('Failed to update wishlist') }
    finally { setActingProductId(null) }
  }

  async function addToCart(productId: string) {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/cart')}`)
      return
    }
  
    setActingProductId(productId)
  
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
  
      if (!res.ok) throw new Error('Failed to add to cart')
  
      // ✅ show success alert first
      alert('Product added to cart successfully!')
  
    } catch (e) {
      console.error(e)
      alert('Failed to add to cart')
    } finally {
      setActingProductId(null)
    }
  }

  return (
    <div className={className}>
      {products.map((product) => {
        const colors = parseColors(product.colors)
        const isWishlisted = wishlistProductIds.has(product.id)
        const hasDiscount = (product.discountPercent ?? 0) > 0 && product.originalPrice

        return (
          <div key={product.id} className="flex flex-col bg-white">

            {/* Image Area */}
            <div className="relative overflow-hidden rounded-xl bg-[#f2f2f0]">
              {/* Badge */}
              {product.badge && (
                <div className="absolute left-3 top-3 z-10">{getBadgeUI(product.badge)}</div>
              )}

              {/* Discount % badge */}
              {hasDiscount && (
                <div className="absolute left-3 bottom-3 z-10">
                  <span className="bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    -{product.discountPercent}%
                  </span>
                </div>
              )}

          

              {/* Add to Cart — appears on hover */}
              <Link href={`/products/${product.id}`} className="block aspect-square overflow-hidden">
                {product.images[0] ? (
                  <img
                    src={product.images[0].imageUrl}
                    alt={product.images[0].altText || product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300 text-xs">
                    No image
                  </div>
                )}
              </Link>

              {/* Add to cart overlay button at bottom */}
              <button
                onClick={() => addToCart(product.id)}
                disabled={actingProductId === product.id}
                className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white text-xs font-medium py-2.5 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
                style={{ opacity: undefined }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {actingProductId === product.id ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>

            {/* Info Area */}
            <div className="pt-3 pb-1 px-0.5">
              {/* Price row */}
<div className="flex items-center justify-between mb-1">

{/* Left: price + original price */}
<div className="flex items-center gap-2">
  <span className="text-base font-bold text-black">
    US ${product.price.toFixed(2)}
  </span>

  {hasDiscount && product.originalPrice && (
    <span className="text-sm text-gray-400 line-through">
      US ${product.originalPrice.toFixed(2)}
    </span>
  )}
</div>

{/* Right: wishlist heart */}
<button
  type="button"
  onClick={() => toggleWishlist(product.id)}
  disabled={actingProductId === product.id}
  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
  className="flex items-center justify-center disabled:opacity-50"
>
  <Heart
    className="h-5 w-5 transition-colors"
    style={{
      fill: isWishlisted ? '#ef4444' : 'none',
      stroke: isWishlisted ? '#ef4444' : '#111',
      strokeWidth: 1.8,
    }}
  />
</button>
</div>

              {/* Name */}
              <Link href={`/products/${product.id}`}>
                <p className="text-sm text-gray-700 leading-snug hover:text-black transition-colors line-clamp-1">
                  {product.name}
                </p>
              </Link>

              {/* Color swatches */}
              {colors.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {colors.slice(0, 5).map((color) => (
                    <span
                      key={color}
                      title={color}
                      className="h-4 w-4 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}