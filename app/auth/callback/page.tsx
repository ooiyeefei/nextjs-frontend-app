'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { createInitialBusinessProfile, getBusinessProfile } from '@/lib/supabase/queries';

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

        // Add debug logging
        console.log('Session data:', {
          user: data.session.user,
          emailConfirmed: data.session.user?.email_confirmed_at,
          timestamp: new Date().toISOString()
        })

        // Check if email is confirmed and business profile exists
        if (data.session.user?.email_confirmed_at) {
          try {
            const existingProfile = await getBusinessProfile();
            
            if (!existingProfile) {
              console.log('No business profile found, creating initial profile...');
              await createInitialBusinessProfile();
              console.log('Initial business profile created successfully');
            }
          } catch (error) {
            console.error('Error handling business profile:', error);
            // Continue with navigation even if profile creation fails
          }
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
