import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TrackOrderPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto text-center p-8">
        <h1 className="text-3xl font-bold">Order Tracking</h1>
        <p className="my-4 text-lg">This is a placeholder for tracking information for Order:</p>
        <p className="font-mono bg-gray-100 p-2 rounded inline-block mb-8">{params.id}</p>
        <div>
          <Link href="/orders/history">
            <Button variant="outline">← Back to Order History</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}