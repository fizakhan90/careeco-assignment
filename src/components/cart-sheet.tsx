"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Minus, Plus, X, CreditCard, Tag, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/context/AuthContext"
import { Label } from "@/components/ui/label" // Corrected import
import { Input } from "./ui/input"
import { toast } from "sonner"
import router from "next/router"

export default function CartSheet({ children }: { children: React.ReactNode }) {
  const { state, removeFromCart, updateQuantity, applyCoupon, removeCoupon } = useCart()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponInput);
    setCouponInput(""); // Clear input after applying
    setIsApplying(false);
  };

  const handleCheckout = () => {
    setIsOpen(false);
    // Redirect logic can be simplified by just navigating
    router.push(user ? "/checkout" : "/login");
  }

  useEffect(() => {
    if (state.couponError) {
      toast.error("Coupon Error", { description: state.couponError });
    }
  }, [state.couponError]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl bg-gradient-to-br from-white via-gray-50 to-blue-50/30 backdrop-blur-xl border-l border-gray-200/50 shadow-2xl flex flex-col">
        <SheetHeader className="border-b border-gray-200/50 pb-6 mb-6">
          <SheetTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            Shopping Cart
            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700 font-semibold">
              {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {state.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
              <ShoppingCart className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Your cart is empty</h3>
            <p className="text-gray-500 mb-8 max-w-sm">
              Discover amazing products and add them to your cart to get started
            </p>
            <Button 
              onClick={() => setIsOpen(false)} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {state.items.map((item) => (
                <div key={item.cartItemId} className="group bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h4>
                      <p className="text-xs text-gray-500 mb-1">{item.brand}</p>
                      {item.selectedSize && <Badge variant="outline" className="text-xs mb-3">Size: {item.selectedSize}</Badge>}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                          {/* --- FIX #1: Use item.cartItemId for updating quantity --- */}
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-md hover:bg-white" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-md hover:bg-white" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 rounded-full" onClick={() => removeFromCart(item.cartItemId)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200/50 pt-6 space-y-6 bg-white/50 backdrop-blur-sm rounded-t-xl -mx-6 px-6 mt-auto">
              {/* Coupon Section */}
              {user && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Discount Code
                  </Label>
                  {state.couponCode ? (
                    <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0 flex-1"><Gift className="h-4 w-4 flex-shrink-0" /><span className="font-medium text-sm truncate">"{state.couponCode}" applied!</span></div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-green-200 rounded-full flex-shrink-0 ml-2" onClick={removeCoupon}><X className="h-3 w-3" /></Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Input id="coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Enter code" className="flex-1 min-w-0 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm" />
                      <Button onClick={handleApplyCoupon} disabled={isApplying} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-3 text-sm flex-shrink-0">{isApplying ? "..." : "Apply"}</Button>
                    </div>
                  )}
                </div>
              )}

              {/* Totals Section */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span className="font-medium">₹{state.total.toFixed(2)}</span></div>
                {state.discount > 0 && <div className="flex justify-between text-sm text-green-600 font-medium"><span>Discount</span><span>- ₹{state.discount.toFixed(2)}</span></div>}
                <div className="flex justify-between text-sm text-gray-600"><span>Shipping</span><span className="text-green-600 font-medium">Free</span></div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold text-lg text-gray-900"><span>Total</span><span className="text-xl">₹{state.finalTotal.toFixed(2)}</span></div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {/* --- FIX #2: Wrapped Continue Shopping in a Link component --- */}
                <Link href="/checkout" className="block" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                    <CreditCard className="h-5 w-5 mr-2" />
                    {user ? "Proceed to Checkout" : "Checkout as guest"}
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full border-gray-300 hover:bg-gray-50 font-medium py-3 rounded-xl">
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}