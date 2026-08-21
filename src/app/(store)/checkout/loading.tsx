import React from 'react';
import { SkeletonCheckout } from '@/components/ui/Skeleton';

export default function CheckoutLoading() {
  return (
    <div className="py-8">
      <SkeletonCheckout />
    </div>
  );
}
