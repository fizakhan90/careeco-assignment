"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Package, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

// Define the shape of an order to match your data
interface Order {
  _id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  orderItems: { name: string }[];
}

export default function OrderHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // --- Fetch Orders from Your Backend ---
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/history`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
        toast.error("Could not fetch order history.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  // --- Handle Order Cancellation ---
  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }

      // Optimistically update the UI to show the new "Cancelled" status
      setOrders(prevOrders =>
        prevOrders.map(o => (o._id === orderId ? { ...o, status: 'Cancelled' } : o))
      );
      toast.success("Order has been cancelled.");
    } catch (error: any) {
      console.error(error);
      toast.error("Cancellation Failed", { description: error.message });
    } finally {
      setCancellingId(null);
    }
  };

  // --- Render Logic ---
  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto text-center p-8">
          <Card className="max-w-md mx-auto p-6">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription className="my-4">Please log in to view your order history.</CardDescription>
            <Link href="/login"><Button>Login</Button></Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <Card className="p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-xl font-semibold">No Orders Yet</h2>
            <p className="mt-1 text-gray-500">You haven't placed any orders with us.</p>
            <Link href="/"><Button className="mt-4">Start Shopping</Button></Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader>
                  <CardTitle>Order #{order._id.substring(18)}</CardTitle>
                  <CardDescription>
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Total:</strong> ₹{order.totalPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
                    <Link href={`/orders/track/${order._id}`}>
                      <Button variant="outline">Track Order</Button>
                    </Link>
                    {order.status === 'Processing' && (
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancellingId === order._id}
                      >
                        {cancellingId === order._id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}