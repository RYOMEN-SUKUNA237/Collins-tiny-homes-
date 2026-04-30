'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        window.location.href = '/admin';
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Check browser console.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-offwhite flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-sage/10 p-8 border border-sage/15">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center justify-center w-12 h-12 rounded-2xl bg-sage shadow-lg shadow-sage/30 mb-4 hover:scale-105 transition-transform">
            <Home className="w-6 h-6 text-white" />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Admin Login</h1>
          <p className="text-sm text-charcoal-light mt-1 text-center">
            Sign in with your admin credentials to access the dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light mb-1.5 ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sage/20 bg-offwhite/50 focus:bg-white focus:outline-none focus:border-sage transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light mb-1.5 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sage/20 bg-offwhite/50 focus:bg-white focus:outline-none focus:border-sage transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-sage text-white font-bold tracking-wide mt-2 hover:bg-sage-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
