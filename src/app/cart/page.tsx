'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      alert('Please login to view your cart.');
      router.push('/login');
    }
  }, [user]);

  if (!user) return null;

  return <div className="p-6">Welcome to your cart, {user.name}!</div>;
}
