"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Lock, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Navbar from "@/components/Navbar"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

// Define the shape of the shipping address to match your backend schema
type ShippingAddress = {
  fullName: string;
  addressLine: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  phone: string;
};

export default function CheckoutPage() {
  // Get state and loading status from BOTH contexts
  const { state: cartState, clearCart, loading: cartLoading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    addressLine: "",
    city: "",
    postalCode: "",
    state: "",
    country: "India",
    phone: "",
  });

  // This effect runs to pre-fill data once authentication state is resolved
  useEffect(() => {
    // Only run this logic once authentication is no longer loading
    if (!authLoading) { 
      if (user) {
        // If user is logged in, pre-fill their name
        setShippingAddress(prev => ({ ...prev, fullName: user.name || "" }));
      } else {
        // If user is a GUEST, load from localStorage
        const savedGuestInfo = localStorage.getItem('guestShippingInfo');
        if (savedGuestInfo) {
          setShippingAddress(JSON.parse(savedGuestInfo));
        }
      }
    }
  }, [user, authLoading]);

  // This function updates the form state and saves guest progress
  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    const updatedAddress = { ...shippingAddress, [field]: value };
    setShippingAddress(updatedAddress);

    // We check for a guest by seeing if the user object is null
    if (!user) { 
      localStorage.setItem('guestShippingInfo', JSON.stringify(updatedAddress));
    }
  };

  // This function handles the final submission to your Express backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const orderPayload = {
      shippingAddress,
      orderItems: cartState.items.map(item => ({
        product: item._id, name: item.name, quantity: item.quantity,
        size: item.selectedSize, price: item.price,
      })),
      totalPrice: cartState.total,
      paymentMethod: "Placeholder",
    };

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (user && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order.');
      }
      
      toast.success("Order Placed Successfully!", {
        description: "Thank you for your purchase. We're preparing your items.",
      });

      clearCart();
      if (!user) {
        localStorage.removeItem('guestShippingInfo');
      }
      
      router.push("/order-success");

    } catch (error: any) {
      console.error("Order submission error:", error);
      toast.error("Order Failed", {
        description: error.message || "There was an error placing your order. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- THE ROBUST LOADING STATE GUARD ---
  // This waits for BOTH authentication and the cart to finish loading.
  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  // --- THE CART EMPTY GUARD ---
  // This now runs only after we are sure the cart has finished loading.
  if (cartState.items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <Card className="w-full max-w-md text-center p-6">
          <CardTitle>Your Cart is Empty</CardTitle>
          <CardDescription className="mt-2 mb-4">Add some items to your cart before checking out.</CardDescription>
          <Link href="/"><Button>Continue Shopping</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link href="/cart" className="flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side: Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader><CardTitle>1. Shipping Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={shippingAddress.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} required /></div>
                <div><Label htmlFor="addressLine">Address Line</Label><Input id="addressLine" value={shippingAddress.addressLine} onChange={(e) => handleInputChange("addressLine", e.target.value)} required /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="city">City</Label><Input id="city" value={shippingAddress.city} onChange={(e) => handleInputChange("city", e.target.value)} required /></div>
                  <div><Label htmlFor="state">State</Label><Input id="state" value={shippingAddress.state} onChange={(e) => handleInputChange("state", e.target.value)} required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="postalCode">Postal Code</Label><Input id="postalCode" value={shippingAddress.postalCode} onChange={(e) => handleInputChange("postalCode", e.target.value)} required /></div>
                  <div><Label htmlFor="country">Country</Label><Input id="country" value={shippingAddress.country} onChange={(e) => handleInputChange("country", e.target.value)} required /></div>
                </div>
                 <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={shippingAddress.phone} onChange={(e) => handleInputChange("phone", e.target.value)} required placeholder="For delivery updates" /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> 2. Payment Details</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center text-sm text-gray-500 bg-gray-100 p-4 rounded-md">
                  This is a placeholder for the payment gateway. <br/>No real payment will be processed.
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isProcessing}>
              {isProcessing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Placing Order...</> : `Place Order`}
            </Button>
          </form>

          {/* Right Side: Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  {cartState.items.map((item) => (
                    <div key={item.cartItemId || item._id} className="flex gap-4 items-center">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} width={64} height={64} className="rounded-md border object-cover" />
                      <div className="flex-1">
                        <p className="font-medium leading-tight">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{cartState.total.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span className="font-medium text-green-600">Free</span></div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>₹{cartState.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}