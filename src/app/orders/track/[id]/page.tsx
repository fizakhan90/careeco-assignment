import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  ArrowLeft,
  Phone,
  Mail,
  ExternalLink,
  Search
} from 'lucide-react';

export default function TrackOrderPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders/history" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order History
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Order #{params.id}</p>
        </div>

        {/* Main Content Card */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <CardTitle className="text-2xl mb-2">Order Tracking</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Order ID</h3>
                <code className="text-2xl font-mono bg-white px-4 py-2 rounded border font-bold text-gray-900">
                  {params.id}
                </code>
              </div>
              
              <div className="text-gray-600">
                <p className="text-lg mb-4">
                  This is a placeholder for tracking information.
                </p>
                <p className="text-sm">
                  In a real application, this page would display detailed tracking information,
                  delivery status, and shipping updates for the order above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tracking Features */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Tracking Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Real-time Updates</h3>
                      <p className="text-sm text-gray-600">Get live tracking information as your package moves</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Delivery Estimates</h3>
                      <p className="text-sm text-gray-600">Accurate delivery time predictions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Package Details</h3>
                      <p className="text-sm text-gray-600">View order contents and shipping information</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Package className="w-4 h-4 mr-2" />
                  View Order Details
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Truck className="w-4 h-4 mr-2" />
                  Track Package
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Carrier Website
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
                <Separator />
                <p className="text-xs text-gray-500 text-center">
                  Available 24/7 for order assistance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}