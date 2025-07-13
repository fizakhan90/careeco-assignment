"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Star, Eye, Check } from 'lucide-react'
import { toast } from "sonner"
import { useCart } from "@/context/CartContext" 

// Define the shape of the product
interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description?: string;
  price: number;
  image?: string;
  rating?: number;
  reviews?: number;
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAdding || justAdded) return;
    
    setIsAdding(true)
    
    try {

      await addToCart(product)
      
      setJustAdded(true)
      toast.success(`${product.name} added to cart!`)
      
      setTimeout(() => setJustAdded(false), 2000)
      
    } catch (error) {
      console.error('Failed to add to cart:', error)
      toast.error('Failed to add item to cart')
    } finally {
      setIsAdding(false)
    }
  }


  return (
    <Card 
      className="group bg-white/70 backdrop-blur-md border-white/50 hover:bg-white/90 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0 flex flex-col flex-1">
        <div className="relative overflow-hidden aspect-square">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
          />
          
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-20">
            <Button size="icon" variant="secondary" className={`h-9 w-9 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 ${isWishlisted ? "text-red-500" : "text-gray-600"}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsWishlisted(!isWishlisted); }}>
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
            <Link href={`/product/${product._id}`}>
              <Button size="icon" variant="secondary" className="h-9 w-9 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">{product.category}</Badge>

          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-20">
            <Button className={`w-full transition-all duration-200 ${justAdded ? "bg-green-500 hover:bg-green-600 text-white" : "bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white"}`} onClick={handleAddToCart} disabled={isAdding || justAdded}>
              {isAdding ? (<div className="flex items-center justify-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" /> Adding...</div>) : justAdded ? (<div className="flex items-center justify-center"><Check className="h-4 w-4 mr-2" /> Added!</div>) : (<div className="flex items-center justify-center"><ShoppingCart className="h-4 w-4 mr-2" /> Quick Add</div>)}
            </Button>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Link href={`/product/${product._id}`}>
                  <h3 className="font-bold text-lg line-clamp-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-200 cursor-pointer">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 font-medium mb-2">{product.brand}</p>
                
                {product.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating!) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating.toFixed(1)} ({product.reviews} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ₹{product.price.toFixed(2)}
            </span>
            <div className="flex gap-2">
              <Link href={`/product/${product._id}`}>
                <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/80">
                  View
                </Button>
              </Link>
              <Button 
                size="sm" 
                className={`transition-all duration-200 w-20 ${justAdded ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"}`}
                onClick={handleAddToCart}
                disabled={isAdding || justAdded}
              >
                {isAdding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : justAdded ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                <span className="ml-1.5">{isAdding ? "" : justAdded ? "Added" : "Add"}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}