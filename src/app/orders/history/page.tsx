"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Loader2, 
  Package, 
  XCircle, 
  ShoppingBag, 
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
        setFilteredOrders(data);
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

  // --- Filter Orders ---
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderItems.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

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

  // --- Helper Functions ---
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // --- Render Logic ---
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <CardTitle className="text-2xl">Access Denied</CardTitle>
                <CardDescription className="text-lg">
                  Please log in to view your order history.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/login">
                  <Button size="lg" className="px-8">Login</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <ShoppingBag className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length}
                  </p>
                </div>
                <Truck className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}
                  </p>
                </div>
                <CreditCard className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {orders.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <Package className="mx-auto h-20 w-20 text-gray-400 mb-6" />
              <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
              <p className="text-gray-500 mb-6 text-lg">You haven't placed any orders with us yet.</p>
              <Link href="/">
                <Button size="lg" className="px-8">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filters */}
            <Card className="shadow-lg border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search orders by ID or product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <Card key={order._id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">
                          Order #{order._id.substring(18)}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 px-3 py-1`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-semibold text-lg">₹{order.totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Link href={`/orders/track/${order._id}`} className="flex-1 sm:flex-none">
                            <Button variant="outline" className="w-full sm:w-auto">
                              <Eye className="mr-2 h-4 w-4" />
                              Track Order
                            </Button>
                          </Link>
                          {order.status === 'Processing' && (
                            <Button
                              variant="destructive"
                              onClick={() => handleCancelOrder(order._id)}
                              disabled={cancellingId === order._id}
                              className="flex-1 sm:flex-none"
                            >
                              {cancellingId === order._id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="mr-2 h-4 w-4" />
                              )}
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {order.orderItems.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2">Order Items:</h4>
                            <div className="text-sm text-gray-600">
                              {order.orderItems.map((item, index) => (
                                <span key={index}>
                                  {item.name}
                                  {index < order.orderItems.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <Card className="shadow-lg border-0">
                <CardContent className="p-12 text-center">
                  <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
                  <p className="text-gray-500">No orders match your current filters.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}