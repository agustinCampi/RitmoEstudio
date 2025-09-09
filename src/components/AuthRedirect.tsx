
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

const AuthRedirect = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if done loading and user exists.
    // This is useful for pages that should not be seen by authenticated users (e.g. login, register)
    if (!loading && user) {
      console.log("AuthRedirect: User detected, redirecting to dashboard...");
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // This component does not render anything.
  return null;
};

export default AuthRedirect;
