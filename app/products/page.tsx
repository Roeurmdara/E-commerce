"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import ProductCardList from "@/components/product-card-list"
import { StorefrontNav } from "@/components/storefront-nav"
import CurvedLoop from "@/components/CurvedLoop"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  discountPercent: number
  stock: number
  colors?: string
  averageRating: number
  reviewCount: number
  images: Array<{ imageUrl: string; altText?: string }>
  category: { name: string }
  seller: { id: string; name: string }
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

/* ---------------- PAGINATION COMPONENT ---------------- */

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1 border border-black disabled:opacity-40"
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1 border ${
            p === page ? "bg-black text-white" : "border-black"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1 border border-black disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}

/* ---------------- MAIN PAGE CONTENT ---------------- */

function ProductsContent() {
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Filters
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [page, setPage] = useState(1)

  /* ---------------- FETCH PRODUCTS ---------------- */

  async function fetchProducts() {
    try {
      setIsLoading(true)
      setError("")

      const params = new URLSearchParams()
      params.append("page", page.toString())
      params.append("limit", "12")

      if (category) params.append("category", category)
      if (search) params.append("search", search)
      if (minPrice) params.append("minPrice", minPrice)
      if (maxPrice) params.append("maxPrice", maxPrice)

      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error("Failed to fetch products")

      const data = await response.json()

      setProducts(data.products)
      setPagination(data.pagination)
    } catch (err) {
      setError("Failed to load products")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------- AUTO FETCH ---------------- */

  useEffect(() => {
    fetchProducts()
  }, [page, category, search, minPrice, maxPrice])

  /* ---------------- HANDLERS ---------------- */

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
  }

  function handleFilterChange() {
    setPage(1)
  }

  /* ---------------- UI ---------------- */

  return (
    <>
      <StorefrontNav sticky />

      {/* HERO */}
      <section className="bg-black text-white h-[130px] flex items-center overflow-hidden">
        <CurvedLoop
          marqueeText="Your ✦ Order ✦ your ✦ Happiest ✦ Good luck. ✦"
          speed={2}
          curveAmount={100}
          direction="right"
          interactive
          className="custom-text-style"
        />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* ---------------- FILTERS ---------------- */}
          <div className="lg:col-span-1 border border-black p-6 h-fit">
            <h2 className="text-xl font-bold text-black mb-6">Filters</h2>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-black bg-white text-black text-sm mb-2"
              />
              <Button type="submit" className="w-full bg-black text-white text-sm py-2">
                Search
              </Button>
            </form>

            {/* Category */}
            <div className="mb-6 pb-6 border-b border-black">
              <h3 className="font-medium text-black mb-3">Category</h3>

              <div className="space-y-2">
                {["", "CLOTHING", "ACCESSORIES"].map((cat) => (
                  <label key={cat} className="flex items-center">
                    <input
                      type="radio"
                      checked={category === cat}
                      onChange={() => {
                        setCategory(cat)
                        handleFilterChange()
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-black">
                      {cat === "" ? "All" : cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="font-medium text-black mb-3">Price Range</h3>

              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 border border-black mb-2 text-sm"
              />

              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 border border-black mb-2 text-sm"
              />

              <Button
                onClick={handleFilterChange}
                className="w-full bg-black text-white text-sm py-2"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* ---------------- PRODUCTS ---------------- */}
          <div className="lg:col-span-3">
            
            {error && (
              <div className="mb-4 p-4 border border-red-500 text-red-600">
                {error}
              </div>
            )}

            {isLoading ? (
              <p className="text-center py-12 text-gray-600">
                Loading products...
              </p>
            ) : products.length === 0 ? (
              <p className="text-center py-12 text-gray-600">
                No products found
              </p>
            ) : (
              <>
                <ProductCardList
                  products={products}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                />

                {/* PAGINATION */}
                {pagination && pagination.pages > 1 && (
                  <Pagination
                    page={page}
                    totalPages={pagination.pages}
                    onChange={setPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="text-center p-8">Loading products...</div>}>
        <ProductsContent />
      </Suspense>
    </div>
  )
}