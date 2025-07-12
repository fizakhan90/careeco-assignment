"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Minus, Plus, X, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/context/AuthContext"
import { Label } from "@radix-ui/react-dropdown-menu"
import { Input } from "./ui/input"
import { toast } from "sonner"

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
    setIsApplying(false);
  };

  const handleCheckout = () => {
    setIsOpen(false)
    if (!user) {
      window.location.href = "/login"
    } else {
      window.location.href = "/checkout"
    }
  }

  useEffect(() => {
    if (state.couponError) {
      toast.error("Coupon Error", { description: state.couponError });
    }
  }, [state.couponError]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg bg-white/95 backdrop-blur-md">
      <div className="p-4 mt-auto border-t">
        {/* --- COUPON SECTION (Only for logged-in users) --- */}
        {user && (
          <>
            <div className="space-y-2">
              <Label htmlFor="coupon">Discount Code</Label>
              {state.couponCode ? (
                <div className="flex items-center justify-between p-2 bg-green-50 text-green-700 rounded-md">
                  <span className="font-semibold">Code "{state.couponCode}" applied!</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeCoupon}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input id="coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
                  <Button onClick={handleApplyCoupon} disabled={isApplying}>
                    {isApplying ? "Applying..." : "Apply"}
                  </Button>
                </div>
              )}
            </div>
            <Separator className="my-4" />
          </>
        )}
        
        {/* --- TOTALS SECTION --- */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{state.total.toFixed(2)}</span>
          </div>
          {state.discount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Discount</span>
              <span>- ₹{state.discount.toFixed(2)}</span>
            </div>
          )}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{state.finalTotal.toFixed(2)}</span>
        </div>
        
        <Link href="/checkout">
          <Button className="w-full mt-4">Proceed to Checkout</Button>
        </Link>
      </div>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({state.itemCount} items)
          </SheetTitle>
          <SheetDescription>Review your items and proceed to checkout</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {state.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some products to get started</p>
              <Button onClick={() => setIsOpen(false)} className="bg-gradient-to-r from-blue-500 to-purple-600">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-6 space-y-4">
                {state.items.map((item) => (
                  <div key={`${item._id}-${item.selectedSize}`} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.brand}</p>
                      {item.selectedSize && <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>}
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <Button size="icon" variant="outline" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeFromCart(item.cartItemId)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${state.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${state.total.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Button onClick={handleCheckout} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <CreditCard className="h-4 w-4 mr-2" /> {user ? "Proceed to Checkout" : "Login to Checkout"}
                  </Button>
                  {!user && (
                    <p className="text-xs text-center text-gray-500">
                      <Link href="/register" className="text-blue-600 hover:underline">Create an account</Link> or{" "}
                      <Link href="/login" className="text-blue-600 hover:underline">sign in</Link>
                    </p>
                  )}
                  <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full">
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
