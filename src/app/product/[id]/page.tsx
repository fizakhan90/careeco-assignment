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
import { useCart } from "@/context/CartContext"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 🔙 Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="relative aspect-square cursor-zoom-in group" onClick={() => setIsZoomed(!isZoomed)}>
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className={`object-cover transition-all duration-500 ${isZoomed ? "scale-150" : "scale-100 group-hover:scale-105"}`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <span className="text-sm font-medium text-gray-700">Click to zoom</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Badge className="w-fit bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 text-sm font-medium">
                {product.category}
              </Badge>

              <h1 className="text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              <p className="text-xl text-gray-600 font-medium">{product.brand}</p>

              {/* ⭐ Rating */}
              <div className="flex items-center gap-3">
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
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* 💰 Price */}
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 py-2">
                ₹{product.price.toLocaleString()}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* 📏 Size Selection */}
            {product.sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 text-lg">Size</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 px-6 font-medium transition-all duration-200 ${
                        selectedSize === size 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105" 
                          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 🔢 Quantity */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 text-lg">Quantity</h3>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  size="icon" 
                  variant="outline"
                  className="h-12 w-12 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold bg-gray-100 px-6 py-3 rounded-lg min-w-[80px] text-center">
                  {quantity}
                </span>
                <Button 
                  onClick={() => setQuantity(quantity + 1)} 
                  size="icon" 
                  variant="outline"
                  className="h-12 w-12 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 🛒 Add to Cart */}
            <div className="space-y-4 pt-4">
              {isLoggedIn ? (
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart - ₹{(product.price * quantity).toLocaleString()}
                </Button>
              ) : (
                <Link href="/login">
                  <Button className="w-full h-14 bg-gray-500 hover:bg-gray-600 text-white text-lg font-semibold transition-all duration-300">
                    Login to Purchase
                  </Button>
                </Link>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 border-gray-300 hover:border-red-400 hover:bg-red-50">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Button>
                <Button variant="outline" className="flex-1 h-12 border-gray-300 hover:border-blue-400 hover:bg-blue-50">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-16">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Product Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <Truck className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Free Delivery</h3>
              <p className="text-sm text-gray-600">Free shipping on orders over ₹500</p>
            </Card>
            <Card className="text-center p-6 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <Shield className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-600">100% secure payment protection</p>
            </Card>
            <Card className="text-center p-6 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <RotateCcw className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-sm text-gray-600">30-day hassle-free returns</p>
            </Card>
          </div>
        </div>

        {/* 🚀 Better Deals Carousel */}
        {betterDeals.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Similar Items & Better Deals</h2>
            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4">
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