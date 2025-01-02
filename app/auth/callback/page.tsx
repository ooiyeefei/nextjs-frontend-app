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
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback...');
        console.log('Cookies:', document.cookie);

        const currentUrl = new URL(window.location.href);
        const searchParams = currentUrl.searchParams;

        // Log query parameters
        console.log('Search Params:', searchParams.toString());

        // Check for query parameter "code"
        const code = searchParams.get('code');
        if (code) {
          console.log('Exchanging code for session:', code);

          // Exchange code for session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code for session:', error.message);
            throw error;
          }

          console.log('Session successfully established with code.');
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
  }, [router]);

  return <div>Processing authentication...</div>;
}
