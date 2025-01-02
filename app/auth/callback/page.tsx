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

// // Check for `access_token` in hash fragment
// const accessToken = hashParams.get('access_token');
// const refreshToken = hashParams.get('refresh_token');
// if (accessToken && refreshToken) {
//   await supabase.auth.setSession({
//     access_token: accessToken,
//     refresh_token: refreshToken,
//   });

//   // Clean up the URL by removing the hash fragment
//   window.history.replaceState(null, '', window.location.pathname);

//   router.push('/dashboard');
//   return;
// }
// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { createBrowserSupabaseClient } from '@/lib/supabase/client';

// export default function AuthCallback() {
//   const router = useRouter();
//   const supabase = createBrowserSupabaseClient();

//   useEffect(() => {
//     const handleAuthCallback = async () => {
//       try {
//         const { searchParams } = new URL(window.location.href);
//         const code = searchParams.get('code');

//         if (!code) {
//           throw new Error('No code found in callback URL');
//         }

//         const { error } = await supabase.auth.exchangeCodeForSession(code);

//         if (error) {
//           console.error('Error exchanging code for session:', error);

//           // Detect missing code verifier
//           if (error.message.includes('auth code and code verifier should be non-empty')) {
//             alert(
//               'Authentication failed. Please ensure you open the magic link in the same browser where you initiated login.'
//             );
//           }

//           router.push('/login');
//           return;
//         }

//         console.log('Session successfully established.');
//         router.push('/dashboard');
//       } catch (error) {
//         console.error('Authentication error:', error);
//         router.push('/login');
//       }
//     };

//     handleAuthCallback();
//   }, [router]);

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="text-center">Processing authentication...</div>
//     </div>
//   );
// }
