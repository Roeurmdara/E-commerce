import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Providers from "./providers";
import "./globals.css";

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
