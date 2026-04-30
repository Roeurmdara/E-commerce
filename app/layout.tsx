import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Providers from "./providers";
import { StorefrontNav } from "@/components/storefront-nav"
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fashion Marketplace - Clothes & Accessories",
  description: "Premium fashion marketplace for clothes and accessories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-black">
        <Providers>
          {/* 👇 Navbar stays on all pages */}
         

          {/* Page content */}
          <main>{children}</main>
        </Providers>

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}