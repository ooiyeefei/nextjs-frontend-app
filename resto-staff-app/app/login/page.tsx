"use client"
import { useState } from 'react';
import { supabase } from '../../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  
  const handleLogin = async () => {
    const { error } = await supabase.auth.signIn({ email });
    if (error) console.error('Error logging in:', error.message);
    else alert('Check your email for the login link!');
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 mb-4 rounded border border-gray-600 bg-black text-white"
        />
        <button className="btn w-full">Send Magic Link</button>
      </div>
    </main>
  );
}
