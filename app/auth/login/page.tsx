"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Car, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Erreur de connexion');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Top Bar - Développé par YK */}
      <div className="relative z-20 bg-gradient-to-r from-royal-600 via-royal-500 to-emerald-500 py-2 text-center text-xs font-medium text-white sm:text-sm">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Développé par <strong>YK</strong> — Solution SaaS Location</span>
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-8 sm:py-12">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-royal-900 via-royal-950 to-accent" />
        
        {/* Animated gradient orbs */}
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-float rounded-full bg-royal-500/20 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute bottom-1/4 right-1/4 h-56 w-56 animate-float rounded-full bg-royal-400/15 blur-3xl sm:h-80 sm:w-80" style={{ animationDelay: '-3s' }} />
        <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-royal-300/10 blur-3xl sm:h-64 sm:w-64" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(16,185,129,0.15)_1px,transparent_0)] bg-[length:40px_40px]" />
        
        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md animate-slide-up">
          {/* Logo */}
          <div className="mb-6 text-center sm:mb-8">
            <Link href="/public-site" className="inline-flex items-center gap-2 sm:gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-royal-400 to-royal-600 shadow-xl shadow-royal-500/30 sm:h-14 sm:w-14 sm:rounded-2xl">
                <Car className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white sm:text-3xl">Auto</span>
                <span className="text-2xl font-extrabold text-royal-400 sm:text-3xl">Rent</span>
              </div>
            </Link>
          </div>
          
          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-2xl border border-royal-500/20 bg-white/10 p-6 shadow-2xl shadow-royal-950/50 backdrop-blur-xl sm:rounded-3xl sm:p-8"
          >
            {/* Glow effect */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-royal-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-royal-400/15 blur-3xl" />
            
            <div className="relative z-10 space-y-5 sm:space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-royal-500/20 px-3 py-1 text-xs font-medium text-royal-300 sm:px-4 sm:py-1.5 sm:text-sm">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  Espace Administration
                </div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Bienvenue</h1>
                <p className="mt-1 text-xs text-royal-300 sm:text-sm">Connectez-vous à votre espace de gestion</p>
              </div>
              
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-royal-200 sm:text-sm" htmlFor="email">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-royal-400 sm:left-4 sm:h-5 sm:w-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@autorent.ma"
                    className="w-full rounded-lg border border-royal-500/30 bg-royal-950/50 py-3 pl-10 pr-4 text-sm text-white placeholder-royal-500 outline-none transition-all duration-300 focus:border-royal-400 focus:ring-2 focus:ring-royal-400/20 sm:rounded-xl sm:py-3.5 sm:pl-12 sm:text-base"
                    required
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-royal-200 sm:text-sm" htmlFor="password">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-royal-400 sm:left-4 sm:h-5 sm:w-5" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-royal-500/30 bg-royal-950/50 py-3 pl-10 pr-4 text-sm text-white placeholder-royal-500 outline-none transition-all duration-300 focus:border-royal-400 focus:ring-2 focus:ring-royal-400/20 sm:rounded-xl sm:py-3.5 sm:pl-12 sm:text-base"
                    required
                  />
                </div>
              </div>
            
            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/20 px-3 py-2 text-xs text-rose-300 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
                {error}
              </div>
            )}
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 text-sm sm:py-4 sm:text-base"
              glow
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white sm:h-5 sm:w-5" />
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Se connecter
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              )}
            </Button>
          </div>
        </form>
        
        {/* Footer */}
        <div className="mt-4 space-y-2 text-center sm:mt-6">
          <p className="text-xs text-royal-400 sm:text-sm">
            Accès réservé aux administrateurs et agents
          </p>
          <Link href="/public-site" className="inline-flex items-center gap-1 text-xs text-royal-500 transition-colors hover:text-royal-300 sm:text-sm">
            ← Retour au site public
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}
