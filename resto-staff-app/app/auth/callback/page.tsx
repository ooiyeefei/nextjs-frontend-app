'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');

        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          router.push('/dashboard');
        } else {
          throw new Error('No code found');
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return <div>Loading...</div>;
}
