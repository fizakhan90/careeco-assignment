import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MyOwn Store - Premium E-commerce Experience",
  description: "Discover unique products that match your style. Quality meets affordability.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
                    <Toaster richColors position="top-center" />

          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
