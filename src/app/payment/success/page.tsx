// src/app/payment/success/page.tsx

"use client";

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserDetailsState } from '@/store/authSlice';
import { useRouter } from 'next/navigation';

const SuccessPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    // Update the user's state to show they are a Pro member
    dispatch(setUserDetailsState({ isPro: true }));

    // Redirect to the main page after 3 seconds
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }, [dispatch, router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Payment Successful!</h1>
      <p>Thank you for subscribing to the Pro plan.</p>
      <p>You will be redirected shortly...</p>
    </div>
  );
};

export default SuccessPage;