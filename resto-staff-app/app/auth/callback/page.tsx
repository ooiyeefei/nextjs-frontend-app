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
        // Handle hash fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set session with Supabase
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          // Clean up URL by removing the hash fragment
          window.history.replaceState(null, "", window.location.pathname);

          // Redirect to dashboard
          router.replace('/dashboard');
        } else {
          throw new Error('No access token found');
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.replace('/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">Loading...</div>
    </div>
  );
}
