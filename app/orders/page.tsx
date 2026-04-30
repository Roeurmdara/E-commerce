"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { StorefrontNav } from "@/components/storefront-nav"
import CurvedLoop from "@/components/CurvedLoop"


interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    size?: string | null
    color?: string | null
    product: {
      id: string
      name: string
      description?: string
      images: Array<{ imageUrl: string; altText?: string | null }>
    }
  }>
  seller: { id: string; name: string }
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  delivered:  { bg: "#EAF3DE", text: "#3B6D11", border: "#97C459", label: "Delivered" },
  returned:   { bg: "#FAECE7", text: "#993C1D", border: "#F0997B", label: "Returned" },
  pending:    { bg: "#FAEEDA", text: "#854F0B", border: "#EF9F27", label: "Pending" },
  processing: { bg: "#E6F1FB", text: "#185FA5", border: "#85B7EB", label: "Processing" },
  cancelled:  { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595", label: "Cancelled" },
}

// Map common color names to hex swatches
const COLOR_HEX: Record<string, string> = {
  red: "#EF4444", blue: "#3B82F6", green: "#22C55E", black: "#18181B",
  white: "#F5F5F5", gray: "#9CA3AF", grey: "#9CA3AF", yellow: "#EAB308",
  orange: "#F97316", purple: "#A855F7", pink: "#EC4899", brown: "#92400E",
  navy: "#1E3A5F", teal: "#14B8A6", coral: "#FF6B6B", beige: "#E8C99A",
  cream: "#FDF6E3", khaki: "#C3B091", olive: "#6B7339", maroon: "#800000",
  sand: "#E8C99A", mint: "#A7F3D0", lavender: "#C4B5FD", indigo: "#6366F1",
  "midnight blue": "#1E3A5F", "forest green": "#3D7D4A", "sky blue": "#38BDF8",
  "rose gold": "#E8B4B8", "burnt orange": "#CC5500", "dusty rose": "#D4A5A5",
}

function getColorHex(colorName?: string): string | null {
  if (!colorName) return null
  const lower = colorName.toLowerCase()
  // Direct match
  if (COLOR_HEX[lower]) return COLOR_HEX[lower]
  // Partial match
  for (const [key, val] of Object.entries(COLOR_HEX)) {
    if (lower.includes(key)) return val
  }
  // Check if it's already a hex
  if (/^#[0-9A-Fa-f]{3,6}$/.test(colorName)) return colorName
  return null
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status.toLowerCase()] ?? STATUS_STYLES.pending
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
    
        fontSize: "12px",
        fontWeight: 500,
        background: s.bg,
        color: s.text,
        border: `0.5px solid ${s.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  )
}

function SearchIcon() {
  return (
    <svg
      style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#888", pointerEvents: "none" }}
      viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
    >
      <circle cx="6.5" cy="6.5" r="4.5" />
      <path d="M10.5 10.5l3 3" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="2" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="14" cy="8" r="1.5" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

const FILTERS = [
  { key: "all",        label: "All" },
  { key: "delivered",  label: "Delivered" },
  { key: "processing", label: "Processing" },
  { key: "returned",   label: "Returned" },
  { key: "pending",    label: "Pending" },
]

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/orders")
      return
    }
    if (status === "authenticated") fetchOrders()
  }, [status])

  async function fetchOrders() {
    try {
      setIsLoading(true)
      const res = await fetch("/api/orders")
      if (!res.ok) throw new Error("Failed to fetch orders")
      setOrders(await res.json())
    } catch (err) {
      setError("Failed to load orders")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return orders.filter((o) => {
      const matchFilter = activeFilter === "all" || o.status.toLowerCase() === activeFilter
      const matchSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.items.some((i) => i.product.name.toLowerCase().includes(q)) ||
        o.seller.name.toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
  }, [orders, search, activeFilter])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading orders…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="mb-6 flex items-baseline gap-3">
        
          <span style={{ fontSize: 13, color: "#888" }}>
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 border border-red-400 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
            <SearchIcon />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, order numbers, sellers…"
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                fontSize: 14,
                border: "0.5px solid #d1d1d1",
        
                background: "#fff",
                color: "#000",
                outline: "none",
              }}
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  padding: "7px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  border: "0.5px solid",
               
                  cursor: "pointer",
                  transition: "all 0.15s",
                  ...(activeFilter === f.key
                    ? { background: "#000", color: "#fff", borderColor: "#000" }
                    : { background: "#fff", color: "#555", borderColor: "#d1d1d1" }),
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm mb-4">
              {orders.length === 0
                ? "You haven't bought any products yet."
                : "No orders match your search."}
            </p>
            {orders.length === 0 && (
              <Link href="/products" className="text-black font-medium text-sm hover:underline">
                Start Shopping →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid #e5e5e5" }}>
                  {["Product", "Order #", "Date", "Total", "Status", ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0 12px 10px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#888",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const firstItem = order.items[0]
                  const productName = firstItem?.product.name ?? "—"
                  const productDesc = firstItem?.product.description ?? ""
                  const productImg = firstItem?.product.images?.[0]
                  const color = firstItem?.color ?? undefined
                  const size = firstItem?.size ?? undefined
                  const colorHex = getColorHex(color)

                  // Total quantity across all items
                  const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0)
                  const extraItems = order.items.length - 1

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: "0.5px solid #f0f0f0",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Product */}
                      <td style={{ padding: "14px 12px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>

                          {/* Product image / fallback */}
                          <div
                            style={{
                              width: 70,
                              height: 70,
     
                              border: "0.5px solid #e5e5e5",
                              overflow: "hidden",
                              flexShrink: 0,
                              background: "#f5f5f5",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#bbb",
                            }}
                          >
                            {productImg ? (
                              <img
                                src={productImg.imageUrl}
                                alt={productImg.altText || productName}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <BoxIcon />
                            )}
                          </div>

                          {/* Name + description + attribute pills */}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 500, color: "#000", marginBottom: 2 }}>
                              {productName}
                              {extraItems > 0 && (
                                <span style={{ fontSize: 11, color: "#aaa", marginLeft: 6, fontWeight: 400 }}>
                                  +{extraItems} more
                                </span>
                              )}
                            </p>

                            {productDesc && (
                              <p style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{productDesc}</p>
                            )}

                            {/* Inline attribute pills */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: productDesc ? 0 : 5 }}>

                              {/* Color pill */}
                              {color && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "2px 8px",
                                  
                                    fontSize: 11,
                                    fontWeight: 500,
                                    background: "#E6F1FB",
                                    color: "#0C447C",
                                    border: "0.5px solid #85B7EB",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {colorHex && (
                                    <span
                                      style={{
                                        display: "inline-block",
                                        width: 9,
                                        height: 9,
                                        borderRadius: "50%",
                                        background: colorHex,
                                        border: "0.5px solid rgba(0,0,0,0.18)",
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                  {color}
                                </span>
                              )}

                              {/* Size pill */}
                              {size && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "2px 8px",
                                
                                    fontSize: 11,
                                    fontWeight: 500,
                                    background: "#FAEEDA",
                                    color: "#633806",
                                    border: "0.5px solid #EF9F27",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {size}
                                </span>
                              )}

                              {/* Item count pill */}
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "2px 8px",
                         
                                  fontSize: 11,
                                  fontWeight: 500,
                                  background: "white",
                                  color: "#27500A",
                                  border: "0.5px solid black",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {totalQty} {totalQty === 1 ? "item" : "items"}
                              </span>

                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Order # */}
                      <td style={{ padding: "14px 12px", verticalAlign: "middle" }}>
                        <span style={{ fontSize: 13, color: "#555", fontFamily: "var(--font-mono, monospace)" }}>
                          {order.orderNumber}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "14px 12px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13, color: "#555" }}>
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Total */}
                      <td style={{ padding: "14px 12px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#000" }}>
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 12px", verticalAlign: "middle" }}>
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Action */}
                    
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Seller note */}
        {filtered.length > 0 && (
          <p style={{ marginTop: 16, fontSize: 12, color: "#aaa" }}>
            Showing orders from {[...new Set(filtered.map((o) => o.seller.name))].join(", ")}
          </p>
        )}
      </div>
    </div>
  )
}
