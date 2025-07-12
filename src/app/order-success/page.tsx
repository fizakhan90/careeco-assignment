// src/app/order-success/page.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar'; // Optional: if you want the navbar here

export default function OrderSuccessPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto flex flex-col items-center justify-center text-center py-20">
        <div className="bg-white p-10 rounded-xl shadow-lg">
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Thank you for your purchase. You will receive a confirmation email shortly with your order details.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button size="lg">Continue Shopping</Button>
            </Link>
            <Link href="/orders/history">
              <Button size="lg" variant="outline">
                View Order History
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}