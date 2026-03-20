'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    /*
    const authSession = Cookies.get('auth_session');

    // If user is not logged in and trying to access protected routes
    // Root (/) is now the login page, so it's public.
    if (!authSession && pathname !== '/') {
      router.push('/');
    }

    // If user is logged in and at the login page (root)
    if (authSession && pathname === '/') {
      router.push('/dashboard');
    }
    */
  }, [pathname, router]);

  return <>{children}</>;
}
