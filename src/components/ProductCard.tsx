"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react'

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description?: string;
  price: number; // ← make sure this is NOT optional
  image?: string;
  rating?: number;
  reviews?: number;
}


interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
}

export default function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isListView = viewMode === "list"

  return (
    <Card 
      className="group bg-white/70 backdrop-blur-md border-white/50 hover:bg-white/90 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className={`p-0 ${isListView ? "flex" : ""}`}>
        <div className={`relative overflow-hidden ${isListView ? "w-48 flex-shrink-0" : "aspect-square"}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          <Image
            src="/placeholder.svg?height=300&width=300"
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
          />
          
          {/* Overlay Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-20">
            <Button
              size="icon"
              variant="secondary"
              className={`h-9 w-9 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200 ${
                isWishlisted ? "text-red-500" : "text-gray-600"
              }`}
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
<Link href={`/product/${product._id}`}>

              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Category Badge */}
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
            {product.category}
          </Badge>

          {/* Quick Add to Cart - Bottom Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-20">
            <Button className="w-full bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white transition-all duration-200">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        </div>

        <div className={`p-6 ${isListView ? "flex-1 flex flex-col justify-between" : ""}`}>
          <div className={isListView ? "flex-1" : ""}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Link href={`/product/${product._id}`}>

                  <h3 className="font-bold text-lg line-clamp-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-200 cursor-pointer">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 font-medium mb-2">{product.brand}</p>
                
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating!)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
            )}
          </div>

          <div className={`flex items-center justify-between ${isListView ? "mt-4" : ""}`}>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-2">
              <Link href={`/product/${product._id}`}>

                <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/80">
                  View
                </Button>
              </Link>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
