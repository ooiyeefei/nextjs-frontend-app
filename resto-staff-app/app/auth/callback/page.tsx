'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const handleHashChange = async () => {
      try {
        // Extract tokens from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) throw error;
          
          // Redirect to dashboard after successful session setup
          router.push('/dashboard');
        } else {
          throw new Error('No tokens found in URL');
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      }
    };

    handleHashChange();
  }, [router, supabase.auth]);

  return <div>Loading...</div>;
}
