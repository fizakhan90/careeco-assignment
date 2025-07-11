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
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [betterDeals, setBetterDeals] = useState<Product[]>([]);


  const { addToCart } = useCart()
  const { user } = useAuth()
  const isLoggedIn = !!user

  useEffect(() => {
  const fetchProduct = async () => {
    setLoading(true)

    try {
      const res = await fetch(`/api/products/${params.id}`)

      if (!res.ok) {
        throw new Error("Product not found")
      }

      const data = await res.json()

      // Now data = { product: {...}, betterDeals: [...] }
      setProduct(data.product)
      setBetterDeals(data.betterDeals)
      setSelectedColor(data.product.colors?.[0] || "")
      setSelectedSize(data.product.sizes?.[0] || "")
    } catch (error) {
      console.error(error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  if (params.id) fetchProduct()
}, [params.id])


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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-md border-white/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square cursor-zoom-in" onClick={() => setIsZoomed(!isZoomed)}>
                  <Image
                    src={product.images[selectedImage] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform duration-500 ${isZoomed ? "scale-150" : "scale-100"}`}
                  />
                  {product.originalPrice && (
                    <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                      Save ${(product.originalPrice - product.price).toFixed(0)}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Images */}
            <div className="flex gap-4">
              {product.images.map((image, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedImage === index ? "ring-2 ring-blue-500 bg-white/90" : "bg-white/70 hover:bg-white/90"
                  } backdrop-blur-md border-white/50`}
                  onClick={() => setSelectedImage(index)}
                >
                  <CardContent className="p-2">
                    <div className="relative w-16 h-16">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">{product.category}</Badge>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`bg-white/70 backdrop-blur-md border-white/50 ${
                      isWishlisted ? "text-red-500" : "text-gray-600"
                    }`}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon" className="bg-white/70 backdrop-blur-md border-white/50">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 font-medium mb-4">{product.brand}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Color Selection */}
            {product.colors && (
              <div>
                <h3 className="font-semibold mb-3">Color</h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      className={`${
                        selectedColor === color
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "bg-white/70 backdrop-blur-md border-white/50 hover:bg-white/90"
                      } transition-all duration-200`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && (
              <div>
                <h3 className="font-semibold mb-3">Size</h3>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className={`${
                        selectedSize === size
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "bg-white/70 backdrop-blur-md border-white/50 hover:bg-white/90"
                      } transition-all duration-200`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/70 backdrop-blur-md border-white/50"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/70 backdrop-blur-md border-white/50"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              {isLoggedIn ? (
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    className="w-full h-14 bg-gray-400 text-white font-semibold text-lg cursor-not-allowed"
                    disabled
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Login to Purchase
                  </Button>
                  <div className="flex gap-3">
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" className="w-full bg-white/70 backdrop-blur-md border-white/50">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                        Register
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <Card className="bg-white/70 backdrop-blur-md border-white/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-white/70 backdrop-blur-md border-white/50">
                <CardContent className="p-4 text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders over $50</p>
                </CardContent>
              </Card>
              <Card className="bg-white/70 backdrop-blur-md border-white/50">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">2 Year Warranty</p>
                  <p className="text-xs text-gray-600">Full coverage</p>
                </CardContent>
              </Card>
              <Card className="bg-white/70 backdrop-blur-md border-white/50">
                <CardContent className="p-4 text-center">
                  <RotateCcw className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">30-Day Returns</p>
                  <p className="text-xs text-gray-600">No questions asked</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-md border-white/50">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card className="bg-white/70 backdrop-blur-md border-white/50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">{product.description}</p>
                  <p className="text-gray-700 leading-relaxed">
                    Our premium wireless headphones are designed for audiophiles who demand the best in sound quality
                    and comfort. With advanced noise cancellation technology, you can immerse yourself in your music
                    without distractions. The 30-hour battery life ensures you can enjoy your favorite tunes all day
                    long, while the quick charge feature gives you hours of playback with just minutes of charging.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <Card className="bg-white/70 backdrop-blur-md border-white/50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Audio</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>Driver Size: 40mm</li>
                        <li>Frequency Response: 20Hz - 20kHz</li>
                        <li>Impedance: 32Ω</li>
                        <li>Sensitivity: 110dB</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Connectivity</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>Bluetooth: 5.0</li>
                        <li>Range: 30 feet</li>
                        <li>Codecs: SBC, AAC, aptX</li>
                        <li>Multi-device pairing: Yes</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Battery</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>Playback Time: 30 hours</li>
                        <li>Charging Time: 2 hours</li>
                        <li>Quick Charge: 5 min = 3 hours</li>
                        <li>Battery Type: Li-ion</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Physical</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>Weight: 250g</li>
                        <li>Dimensions: 7.5 x 6.5 x 3 inches</li>
                        <li>Foldable: Yes</li>
                        <li>Cable Length: 1.2m</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Card className="bg-white/70 backdrop-blur-md border-white/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Customer Reviews</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{product.rating}</span>
                      <span className="text-gray-600">({product.reviews} reviews)</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Sample Reviews */}
                    <div className="border-b border-gray-200 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="font-semibold">Amazing sound quality!</span>
                      </div>
                      <p className="text-gray-700 mb-2">
                        These headphones exceeded my expectations. The noise cancellation is incredible and the battery
                        life is exactly as advertised.
                      </p>
                      <p className="text-sm text-gray-500">- Sarah M. • Verified Purchase</p>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                          <Star className="h-4 w-4 text-gray-300" />
                        </div>
                        <span className="font-semibold">Great for work calls</span>
                      </div>
                      <p className="text-gray-700 mb-2">
                        Perfect for remote work. The microphone quality is excellent and they're comfortable for all-day
                        wear.
                      </p>
                      <p className="text-sm text-gray-500">- Mike R. • Verified Purchase</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="font-semibold">Worth every penny</span>
                      </div>
                      <p className="text-gray-700 mb-2">
                        Premium build quality and the sound is crystal clear. The quick charge feature is a game
                        changer.
                      </p>
                      <p className="text-sm text-gray-500">- Alex K. • Verified Purchase</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          {betterDeals.length > 0 && (
  <div className="mt-12">
    <h2 className="text-2xl font-bold mb-4">Better Deals</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {betterDeals.map((deal) => (
        <ProductCard key={deal._id} product={deal} />
      ))}
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  )
}


