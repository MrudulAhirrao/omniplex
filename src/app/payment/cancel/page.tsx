// src/app/payment/cancel/page.tsx

"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CancelPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the profile page after 3 seconds
    setTimeout(() => {
      router.push('/profile'); // Or wherever your profile page is
    }, 3000);
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Payment Cancelled</h1>
      <p>Your payment was not processed. You can try again from your profile.</p>
      <p>Redirecting you back...</p>
    </div>
  );
};

export default CancelPage;