"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Minus, Plus, ShoppingBag, Star, Truck } from "lucide-react"
import { StorefrontNav } from "@/components/storefront-nav"
import CurvedLoop from "@/components/CurvedLoop"

type ProductImage = {
  id: string
  imageUrl: string
  altText?: string
  isMain: boolean
}

type ProductReview = {
  id: string
  rating: number
  title?: string
  comment?: string
  user: { id: string; name?: string; image?: string }
  createdAt: string
}

type SimilarProduct = {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  images: Array<{ imageUrl: string; altText?: string }>
  category: { name: string }
}

interface ProductDetail {
  id: string
  sku: string
  name: string
  description: string
  price: number
  originalPrice?: number | null
  discountPercent: number
  stock: number
  averageRating: number
  reviewCount: number
  sizes: string
  colors: string
  images: ProductImage[]
  reviews: ProductReview[]
  category: { name: string }
  seller: {
    id: string
    name: string
    sellerProfile?: {
      storeName: string
      storeImage?: string
      rating: number
    }
  }
  similarItems: SimilarProduct[]
}

function parseJsonArray(value?: string) {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : []
  } catch {
    return []
  }
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`
}

function getColorStyle(color: string) {
  return { backgroundColor: color.toLowerCase() }
}

export default function ProductDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const productId = params?.id
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (productId) {
      fetchProduct(productId)
    }
  }, [productId])

  async function fetchProduct(id: string) {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`/api/products/${id}`)
      if (!response.ok) throw new Error("Product not found")
      const data = await response.json()
      setProduct(data)
      setSelectedImage(0)
    } catch (err) {
      setError("Failed to load product")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddToCart() {
    if (!productId) return

    if (!session) {
      router.push("/auth/signin?callbackUrl=" + window.location.pathname)
      return
    }

    setIsAddingToCart(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          size: selectedSize || null,
          color: selectedColor || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to add to cart")

      alert("Added to cart!")
    } catch (err) {
      alert("Failed to add to cart")
      console.error(err)
    } finally {
      setIsAddingToCart(false)
    }
  }

  async function handleAddToWishlist() {
    if (!productId) return

    if (!session) {
      router.push("/auth/signin?callbackUrl=" + window.location.pathname)
      return
    }

    setIsAddingToWishlist(true)
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) throw new Error("Failed to add to wishlist")

      alert("Added to wishlist!")
    } catch (err) {
      alert("Failed to add to wishlist")
      console.error(err)
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Product not found"}</p>
          <Link href="/products" className="text-black font-mono hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const sizes = parseJsonArray(product.sizes)
  const colors = parseJsonArray(product.colors)
  const mainImage =
    product.images[selectedImage] || product.images.find((img) => img.isMain) || product.images[0]
  const sellerName = product.seller.sellerProfile?.storeName || product.seller.name
  const canIncreaseQuantity = quantity < Math.max(product.stock, 1)

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <StorefrontNav />
      <section className="bg-black text-white h-[130px] flex items-center overflow-hidden">
  <CurvedLoop 
    marqueeText="this ✦ is ✦ your ✦ Order ✦ Page. ✦"
    speed={2}
    curveAmount={100}
    direction="right"
    interactive
    className="custom-text-style"
  />
</section>

      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <Link href="/products" className="mb-2 inline-block text-sm text-gray-600 hover:text-black">
          ← Back to Products
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-4 aspect-square overflow-hidden o border-solid #d1d1d1 bg-[#f3f3f3]">
              {mainImage ? (
                <img
                  src={mainImage.imageUrl}
                  alt={mainImage.altText || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 transition ${
                      idx === selectedImage ? "border-black" : "border-gray-300 hover:border-black/50"
                    }`}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="oborder border-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black">
                {product.category.name}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="h-4 w-4 fill-black text-black" />
                <span className="font-semibold text-black">{product.averageRating.toFixed(1)}</span>
                <span>({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="mb-4 text-4xl font-bold text-black">{product.name}</h1>

            <div className="mb-6 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-black">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {product.discountPercent > 0 && (
                <span className="obg-black px-3 py-1 text-sm font-bold text-white">
                  Save {product.discountPercent}%
                </span>
              )}
            </div>

            <p className="mb-6 max-w-2xl text-base leading-7 text-gray-700">{product.description}</p>

            <div className="mb-6 border border-gray-300  bg-white p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Product Information</p>
            
                  <p className="mt-1 text-sm text-gray-700">SKU: <span className="font-mono text-black">{product.sku}</span></p>
                </div>
                <div className="rounded-xl bg-[#f5f5f5] px-4 py-3 text-sm">
                  {product.stock > 0 ? (
                    <p className="font-mono text-black">In stock: {product.stock}</p>
                  ) : (
                    <p className="font-mono text-red-600">Out of stock</p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 border-t border-dashed border-gray-300 pt-4 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f7f7f7] p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500">Category</p>
                  <p className="mt-1 font-mono text-black">{product.category.name}</p>
                </div>
                <div className="rounded-xl bg-[#f7f7f7] p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500">Delivery</p>
                  <p className="mt-1 flex items-center gap-2 font-mono text-black">
                    <Truck className="h-4 w-4" />
                    Ships in 1-3 days
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              {product.stock > 0 ? (
                <p className="text-sm font-mono text-black">Ready to order now</p>
              ) : (
                <p className="text-sm font-mono text-red-600">Out of Stock</p>
              )}
            </div>

            {sizes.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-mono text-black">Select Size</label>
                  {selectedSize && <span className="text-sm text-gray-500">Chosen: {selectedSize}</span>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-14 oborder px-4 py-2 text-sm font-mono transition ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-black bg-white text-black hover:bg-[#f5f5f5]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-mono text-black">Select Color</label>
                  {selectedColor && <span className="text-sm text-gray-500">Chosen: {selectedColor}</span>}
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`inline-flex items-center gap-3 oborder px-4 py-2 text-sm font-mono transition ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-black bg-white text-black hover:bg-[#f5f5f5]"
                      }`}
                    >
                      <span
                        className="h-5 w-5 oborder border-black/20"
                        style={getColorStyle(color)}
                      />
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="mb-3 block text-sm font-mono text-black">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center oborder border-black bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-black transition hover:bg-[#f5f5f5]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-12 text-center text-lg font-bold text-black">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                    disabled={!canIncreaseQuantity}
                    className="px-4 py-3 text-black transition hover:bg-[#f5f5f5] disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                  aria-label="Add to wishlist"
                  className="inline-flex h-12 w-12 items-center justify-center oborder border-black bg-white text-black transition hover:bg-black hover:text-white disabled:opacity-50"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mb-4 flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock === 0}
                className="h-12 flex-1 obg-black text-white hover:opacity-85 disabled:opacity-50"
              >
                <ShoppingBag className="h-4 w-4" />
                {isAddingToCart ? "Adding..." : "Add to Bag"}
              </Button>
            </div>

            <Button
              onClick={async () => {
                await handleAddToCart()
                router.push("/checkout")
              }}
              disabled={product.stock === 0 || isAddingToCart}
              variant="outline"
              className="mb-4 h-12 w-full border border-gray-400 text-black hover:bg-black hover:text-white"
            >
              Buy Now / Checkout
            </Button>

            <div className="border border-gray-300 bg-white p-6">
              <h2 className="mb-3 text-lg font-bold text-black">Product information</h2>
              <p className="whitespace-pre-line text-gray-700">{product.description}</p>
            </div>

            

            {product.reviews.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-black">Recent Reviews</h2>
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className=" border-gray-400 bg-white p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="font-mono text-black">{review.user.name || "Anonymous"}</p>
                        <span className="text-sm font-bold text-black">{review.rating}/5</span>
                      </div>
                      {review.title && <p className="font-mono text-black mb-1">{review.title}</p>}
                      {review.comment && <p className="text-gray-700 text-sm">{review.comment}</p>}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {product.similarItems.length > 0 && (
          <section className="mt-16 border-t border-black pt-10">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">You may also like</p>
                <h2 className="mt-2 text-3xl font-bold text-black">Similar Items</h2>
              </div>
              <Link href="/products" className="text-sm font-mono text-black hover:underline">
                View all products
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 xl:grid-cols-4">
              {product.similarItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="overflow-hidden o border border-black bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-square bg-[#f3f3f3]">
                    {item.images[0] ? (
                      <img
                        src={item.images[0].imageUrl}
                        alt={item.images[0].altText || item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="mb-2 text-xs uppercase tracking-[0.15em] text-gray-500">{item.category.name}</p>
                    <h3 className="line-clamp-2 font-semibold text-black">{item.name}</h3>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-lg font-bold text-black">{formatPrice(item.price)}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
