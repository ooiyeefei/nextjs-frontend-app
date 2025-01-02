// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { createBrowserSupabaseClient } from '@/lib/supabase/client'

// export default function AuthCallback() {
//   const router = useRouter();
//   const supabase = createBrowserSupabaseClient();

//   useEffect(() => {
//     const handleAuthCallback = async () => {
//       try {
//         const { searchParams } = new URL(window.location.href);
//         const code = searchParams.get('code');

//         if (code) {
//           await supabase.auth.exchangeCodeForSession(code);
//           router.push('/dashboard');
//         } else {
//           throw new Error('No code found');
//         }
//       } catch (error) {
//         console.error('Error:', error);
//         router.push('/login');
//       }
//     };

//     handleAuthCallback();
//   }, [router, supabase.auth]);

//   return <div>Loading...</div>;
// }

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
        const currentUrl = new URL(window.location.href);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));

        const code = searchParams.get('code');

        if (code) {
          console.log('Exchanging code for session:', code);
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;

          router.push('/dashboard');
          return;
        }

        // Check for hash fragment access_token
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          console.log('Setting session with access token.');
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          window.history.replaceState(null, '', window.location.pathname); // Clean up URL
          router.push('/dashboard');
          return;
        }

        throw new Error('No valid authentication parameters found.');
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return <div>Loading...</div>;
}