'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session from URL
        const { error } = await supabase.auth.getSession();
        if (error) throw error;

        // Redirect after successful authentication
        router.push('/dashboard');
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [router, supabase.auth]);

  return <div>Loading...</div>;
}
