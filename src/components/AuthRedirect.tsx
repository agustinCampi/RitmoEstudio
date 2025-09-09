
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

const AuthRedirect = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This component is no longer used for redirection.
    // The middleware handles all redirection logic now.
    // Keeping the file to avoid breaking imports, but it does nothing.
  }, []);

  // This component does not render anything.
  return null;
};

export default AuthRedirect;
