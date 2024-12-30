'use client';

import { lusitana } from '@/app/ui/fonts';
import { AtSymbolIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js'

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      setEmailSent(true);
      setMessage('Check your email for the login link!');
    } catch (error) {
      setMessage('Error sending magic link');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to Your App.
          </h1>
          <p className="text-gray-400">
            Manage reservations efficiently.
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="flex-1 rounded-lg bg-gray-800 px-6 pb-4 pt-8">
            <div className="w-full">
              <div>
                <label
                  className="mb-3 mt-5 block text-xs font-medium text-gray-300"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-md border border-gray-600 bg-gray-700 py-[9px] pl-10 text-sm text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={emailSent}
                  />
                  <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 peer-focus:text-blue-500" />
                </div>
              </div>
            </div>
            <Button 
              className="mt-4"
              disabled={loading || emailSent}
              onClick={handleLogin}
            >
              <span>{loading ? 'Sending...' : emailSent ? 'Email Sent' : 'Send Magic Link'}</span>
              {!loading && !emailSent && <ArrowRightIcon className="h-5 w-5" />}
            </Button>
            {message && (
              <div className="mt-4 text-center text-sm text-gray-300">
                {message}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
