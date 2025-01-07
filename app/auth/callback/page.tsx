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
      console.log('🔑 Auth Callback:', {
        timestamp: new Date().toISOString()
      });
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          console.error('Error retrieving session:', error);
          router.push('/login');
          return;
        }

        console.log('Session successfully established:', data.session);
        router.push('/dashboard');
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  return <div>Processing authentication...</div>;
}
