import { createBrowserSupabaseClient } from './client';

export async function signInWithOtp(email: string) {
  const supabase = createBrowserSupabaseClient();
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error sending magic link:', error);
    throw error;
  }
}
