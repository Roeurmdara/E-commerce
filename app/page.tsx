import Link from "next/link"
import { ProductBadge } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import ProductCardList, { type ProductCardItem } from "@/components/product-card-list"
import { StorefrontNav } from "@/components/storefront-nav"
import PromoSlider from "@/components/PromoSlider"
import CurvedLoop from "@/components/CurvedLoop"
import TechLogoSection from "@/components/TechLogoSection";




/* =========================
   FETCH BY BADGE
========================= */
async function getProductsByBadge(badge?: ProductBadge): Promise<ProductCardItem[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(badge ? { badge } : {}),
    },
    include: {
      seller: { include: { sellerProfile: true } },
      images: { where: { isMain: true } },
      category: true,
    },
    take: 6,
  })

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    discountPercent: product.discountPercent,
    stock: product.stock,
    colors: product.colors,
    averageRating: product.averageRating,
    reviewCount: product.reviewCount,
    badge: product.badge,
    images: product.images.map((image) => ({
      imageUrl: image.imageUrl,
      altText: image.altText,
    })),
    category: product.category ? { name: product.category.name } : null,
  }))
}

/* =========================
   PAGE
========================= */
export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ section?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const selectedSection = resolvedSearchParams?.section || "all"

  const bestSellers = await getProductsByBadge("BEST_SELLER")
  const newArrivals = await getProductsByBadge("NEW_ARRIVAL")
  const saleProducts = await getProductsByBadge("SALE")

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StorefrontNav />

     {/* ── HERO ─────────────────────────────────────────────── */}
<section
  className="relative flex items-center justify-center min-h-[480px] bg-cover bg-center"
  style={{
    backgroundImage:
      "url('https://i.pinimg.com/1200x/97/78/b6/9778b60847f65ab2094aa152dff1e2f6.jpg')",
  }}
>
  {/* dark overlay for readability */}


  

  {/* centered content */}
  <div className="relative z-10 text-center px-6 max-w-2xl">
    <p className="text-[11px] tracking-[3px] uppercase text-white/70 mb-100">
      Urban Edge
    </p>

   

    <Button
      asChild
      className="bg-white text-black hover:bg-gray-200 rounded-none px-8 py-3 text-sm font-medium tracking-wide"
    >
      <Link href="/products">Shop Now</Link>
    </Button>
  </div>
</section>
    
 
      <section className="bg-black text-white overflow-hidden ">
        <TechLogoSection />
      </section>
      {/* ── FILTER TABS ──────────────────────────────────────── */}
      <section className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-8 flex justify-center items-center">
          {[
            { label: "All", value: "all", href: "/" },
            { label: "New Arrival", value: "new", href: "/?section=new" },
            { label: "Best Seller", value: "best", href: "/?section=best" },
            { label: "Sale", value: "sale", href: "/?section=sale" },
          ].map((tab) => (
            <Link
              key={tab.value}
              href={tab.href}
              className={`px-7 py-4 text-sm font-medium tracking-wide border-b-2 transition-colors ${
                selectedSection === tab.value
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── BEST SELLERS ─────────────────────────────────────── */}
      {(selectedSection === "all" || selectedSection === "best") && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-3xl font-bold font-mono text-center tracking-wider mb-10">Best Sellers</h2>
            <ProductCardList
              products={bestSellers}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            />
          </div>
        </section>
      )}
        <section className="py-16   ">
          <div className="max-w-7xl mx-auto ">
            <PromoSlider />
          </div>
        </section>
      
      {/* ── NEW ARRIVALS ──────────────────────────────────────── */}
      {(selectedSection === "all" || selectedSection === "new") && (
        <section className="py-16  border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="font-mono text-3xl font-bold text-center tracking-wider mb-10">New Arrivals</h2>
            <ProductCardList
              products={newArrivals}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            />
          </div>
        </section>
      )}
<section className="bg-black text-white h-[130px] flex items-center overflow-hidden">
  <CurvedLoop 
    marqueeText="Be ✦ Creative ✦ With ✦ React ✦ Bits ✦"
    speed={2}
    curveAmount={100}
    direction="right"
    interactive
    className="custom-text-style"
  />
</section>
      {/* ── SALE PRODUCTS ────────────────────────────────────── */}
      {(selectedSection === "all" || selectedSection === "sale") && (
        <section className="py-16 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="font-mono text-3xl font-bold text-center tracking-wider mb-10">Sale Products</h2>
            <ProductCardList
              products={saleProducts}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            />
          </div>
        </section>
      )}

      


      {/* ── PROMO BANNER GRID ────────────────────────────────── */}
{selectedSection === "all" && (
  <section className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-100">
    
    {/* LEFT HERO BANNER */}
    <div className="relative overflow-hidden group">
      <img
        src="https://i.pinimg.com/736x/7b/49/81/7b49818db3fa938bf133cba70c26c0cd.jpg"
        alt="Women's collection"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/15 to-transparent flex items-end p-8">
        <div>
          <p className="text-[10px] tracking-[3px] uppercase text-white/60 mb-2">
            Ethereal Elegance
          </p>

          <h3 className="font-monotext-3xl md:text-4xl font-semibold text-white leading-tight mb-5">
            Where Dreams <br /> Meet Couture
          </h3>

          <Button
            asChild
            className="bg-white text-black hover:bg-white/90 rounded-none px-6 py-2 text-xs font-medium tracking-wide transition"
          >
            <Link href="/products?category=women">Shop Now</Link>
          </Button>
        </div>
      </div>
    </div>


    {/* RIGHT SIDE GRID */}
    <div className="grid grid-rows-2">
      
      {/* TOP RIGHT BANNER */}
      <div className="relative overflow-hidden group">
        <img
          src="https://i.pinimg.com/736x/d4/39/7f/d4397ffbcc8d154b481745df8c849335.jpg"
          alt="Footwear"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/18 to-transparent flex items-end p-6">
          <div>
            <p className="text-[10px] tracking-[3px] uppercase text-white/60 mb-1">
              Urban Strides
            </p>

            <h3 className="font-monotext-2xl font-semibold text-white leading-tight mb-4">
              Chic Footwear <br /> for City Living
            </h3>

            <Button
              asChild
              className="bg-white text-black hover:bg-white/90 rounded-none px-5 py-2 text-xs font-medium tracking-wide"
            >
              <Link href="/products?category=footwear">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* BOTTOM CTA TILE */}
      <div className="bg-gradient-to-br from-[#14263d] to-[#0f1c2e] flex flex-col items-center justify-center text-center p-8">
        <p className="text-[10px] tracking-[3px] uppercase text-white/50 mb-3">
          Trendsetting Bags for Her
        </p>

        <div className="font-monotext-6xl md:text-7xl font-bold text-white leading-none">
          50<span className="text-3xl">%</span>
        </div>

        <p className="text-white/40 text-xs mt-2 mb-6">
          on selected handbags
        </p>

        <Button
          asChild
          className="bg-white text-black hover:bg-white/90 rounded-none px-8 py-2 text-xs font-medium tracking-wide transition"
        >
          <Link href="/products?badge=SALE&category=bags">
            Shop Now
          </Link>
        </Button>
      </div>
    </div>
  </section>
)}

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-black text-white/40 text-center py-6 text-xs mt-auto">
        © 2024 Fashion Marketplace
      </footer>
    </div>
  )
}