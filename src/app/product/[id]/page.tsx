"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft, Heart, Share2, Star, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/Navbar"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import ProductCard from "@/components/ProductCard"

interface Product {
  _id: string
  name: string
  brand: string
  category: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviews: number
  inStock: boolean
  sizes?: string[]
  colors?: string[]
  features: string[]
}

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string }

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [betterDeals, setBetterDeals] = useState<Product[]>([])

  const { addToCart } = useCart()
  const { user } = useAuth()
  const isLoggedIn = !!user

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`)

        if (!res.ok) throw new Error("Product not found")

        const data = await res.json()

        const formattedProduct: Product = {
          _id: data.product._id,
          name: data.product.name,
          brand: data.product.brand,
          category: data.product.category,
          description: data.product.description,
          price: data.product.price,
          originalPrice: undefined,
          images: [data.product.image],
          rating: data.product.rating ?? 4,
          reviews: data.product.numReviews ?? 0,
          inStock: data.product.isAvailable ?? true,
          sizes: data.product.sizes ?? [],
          colors: [],
          features: []
        }

        setProduct(formattedProduct)
        setBetterDeals(data.betterDeals)
        setSelectedColor(formattedProduct.colors?.[0] || "")
        setSelectedSize(formattedProduct.sizes?.[0] || "")
      } catch (error) {
        console.error(error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.error("Please login to add items to your cart")
      return
    }

    if (!product) return

    for (let i = 0; i < quantity; i++) {
      addToCart({
        _id: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.images[0],
        selectedColor,
        selectedSize,
      })
    }

    toast.success(`${quantity} x ${product.name} added to cart`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link href="/">
          <Button>Go back</Button>
        </Link>
      </div>
    )
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
    <Navbar />

    <div className="container mx-auto px-4 py-8">
      {/* 🔙 Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-gray-600 hover:text-black flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
      </div>

      {/* 🛍️ Product Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Product Image */}
        <div>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square cursor-zoom-in" onClick={() => setIsZoomed(!isZoomed)}>
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className={`object-cover transition-transform duration-300 ${isZoomed ? "scale-150" : "scale-100"}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Product Info */}
        <div className="space-y-4">
          <Badge className="w-fit bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            {product.category}
          </Badge>

          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-lg text-gray-600">{product.brand}</p>

          {/* ⭐ Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          {/* 💰 Price */}
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            ₹{product.price.toLocaleString()}
          </div>

          {/* 📏 Size Selection */}
          {product.sizes.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-1">Size</h3>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className={selectedSize === size ? "bg-blue-600 text-white" : ""}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 🔢 Quantity */}
          <div className="mt-4">
            <h3 className="font-medium text-gray-700 mb-1">Quantity</h3>
            <div className="flex items-center gap-2">
              <Button onClick={() => setQuantity(Math.max(1, quantity - 1))} size="icon" variant="outline">
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold">{quantity}</span>
              <Button onClick={() => setQuantity(quantity + 1)} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 🛒 Add to Cart */}
          <div className="mt-6">
            {isLoggedIn ? (
              <Button
                onClick={handleAddToCart}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            ) : (
              <Link href="/login">
                <Button className="w-full h-12 bg-gray-400 text-white">Login to Purchase</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 📜 Description */}
      <div className="mt-12 max-w-2xl text-gray-700 text-lg">
        <h2 className="text-xl font-semibold mb-2">Product Description</h2>
        <p>{product.description}</p>
      </div>

      {/* 🚀 Better Deals Carousel */}
      {betterDeals.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Similar Items / Better Deals</h2>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2">
            {betterDeals.map((deal) => (
              <div key={deal._id} className="snap-start flex-shrink-0 w-72">
                <ProductCard
                  product={{
                    ...deal,
                    images: [deal.images ?? "/placeholder.svg"],
                    rating: deal.rating ?? 4,
                    reviews: deal.reviews ?? 0,
                    inStock: deal.isAvailable ?? true,
                    features: [],
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)

}
