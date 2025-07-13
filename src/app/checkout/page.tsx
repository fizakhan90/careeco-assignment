"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock, CreditCard, Loader2, Shield, Truck, CheckCircle, Wallet, Building, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
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
    if (!authLoading) {
      if (user) {
        setShippingAddress((prev) => ({ ...prev, fullName: user.name || "" }));
      } else {
        const savedGuestInfo = localStorage.getItem("guestShippingInfo");
        if (savedGuestInfo) {
          setShippingAddress(JSON.parse(savedGuestInfo));
        }
      }
    }
  }, [user, authLoading]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    const updatedAddress = { ...shippingAddress, [field]: value };
    setShippingAddress(updatedAddress);
    if (!user) {
      localStorage.setItem("guestShippingInfo", JSON.stringify(updatedAddress));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const orderPayload = {
      shippingAddress,
      orderItems: cartState.items.map((item) => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        size: item.selectedSize,
        price: item.price,
      })),
      totalPrice: cartState.finalTotal, 
      paymentMethod: selectedPaymentMethod,
      couponApplied: cartState.couponCode || null, 
    };

    const headers: HeadersInit = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (user && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order.");
      }

      toast.success("Order Placed Successfully!", {
        description: "Thank you for your purchase. We're preparing your items.",
      });

      clearCart();
      if (!user) {
        localStorage.removeItem("guestShippingInfo");
      }
      router.push("/order-success");
    } catch (error: any) {
      console.error("Order submission error:", error);
      toast.error("Order Failed", {
        description:
          error.message ||
          "There was an error placing your order. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };


  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  
  if (cartState.items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <Card className="w-full max-w-md text-center p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-gray-400" />
            </div>
            <CardTitle className="text-2xl mb-2">Your Cart is Empty</CardTitle>
            <CardDescription className="text-gray-600">
              Add some items to your cart before checking out.
            </CardDescription>
          </div>
          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Continue Shopping
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">Complete your purchase securely</p>
        </div>

        {/* Security Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="text-green-800 font-medium">Secure Checkout</span>
            <span className="text-green-600 hidden sm:inline">•</span>
            <span className="text-green-700 text-sm hidden sm:inline">Your information is protected with 256-bit SSL encryption</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Side: Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <Card className="shadow-md border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg py-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="h-5 w-5" />
                    1. Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        value={shippingAddress.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        required
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number *
                      </Label>
                      <div className="mt-1 relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          required
                          className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="For delivery updates"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="addressLine" className="text-sm font-medium text-gray-700">
                      Address Line *
                    </Label>
                    <Input
                      id="addressLine"
                      value={shippingAddress.addressLine}
                      onChange={(e) => handleInputChange("addressLine", e.target.value)}
                      required
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Street address, P.O. Box, company name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City *
                      </Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                        State *
                      </Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        required
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter state"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                        Postal Code *
                      </Label>
                      <Input
                        id="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        required
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter postal code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                        Country *
                      </Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        required
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="shadow-md border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg py-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5" />
                    2. Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <RadioGroup
                    value={selectedPaymentMethod}
                    onValueChange={setSelectedPaymentMethod}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="card" id="card" />
                      <div className="flex items-center space-x-3 flex-1">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          <div className="font-medium">Credit/Debit Card</div>
                          <div className="text-sm text-gray-500">Visa, MasterCard, American Express</div>
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="upi" id="upi" />
                      <div className="flex items-center space-x-3 flex-1">
                        <Wallet className="h-5 w-5 text-purple-600" />
                        <Label htmlFor="upi" className="flex-1 cursor-pointer">
                          <div className="font-medium">UPI</div>
                          <div className="text-sm text-gray-500">Pay using UPI ID or scan QR code</div>
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <div className="flex items-center space-x-3 flex-1">
                        <Building className="h-5 w-5 text-indigo-600" />
                        <Label htmlFor="netbanking" className="flex-1 cursor-pointer">
                          <div className="font-medium">Net Banking</div>
                          <div className="text-sm text-gray-500">All major banks supported</div>
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <div className="flex items-center space-x-3 flex-1">
                        <Wallet className="h-5 w-5 text-orange-600" />
                        <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                          <div className="font-medium">Digital Wallet</div>
                          <div className="text-sm text-gray-500">Paytm, PhonePe, Google Pay</div>
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="cod" id="cod" />
                      <div className="flex items-center space-x-3 flex-1">
                        <Truck className="h-5 w-5 text-green-600" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <div className="font-medium">Cash on Delivery</div>
                          <div className="text-sm text-gray-500">Pay when you receive your order</div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Lock className="h-4 w-4" />
                      <span className="font-medium text-sm">Payment Security</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">
                      This is a demo checkout. No actual payment will be processed.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Place Order Securely
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-md border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartState.items.map((item) => (
                    <div
                      key={item.cartItemId || item._id}
                      className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={50}
                          height={50}
                          className="rounded-md border object-cover"
                        />
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm leading-tight truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Size: {item.selectedSize || 'N/A'}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal</span>
                    <span>₹{cartState.finalTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  {cartState.couponCode && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Discount ({cartState.couponCode})</span>
                      <span>Applied</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span>₹{cartState.finalTotal.toFixed(2)}</span>
                </div>

                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Truck className="h-4 w-4" />
                    <span className="font-medium text-sm">Free Shipping</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Estimated delivery: 3-5 business days
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}