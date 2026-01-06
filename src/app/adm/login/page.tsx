'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        userType: 'SUPER_ADMIN',
        redirect: false,
      });

      if (result?.error) {
        setError('Kullanıcı adı veya şifre hatalı');
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--iptv-background)] overflow-hidden">
      {/* Ambient Background Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--iptv-primary)]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-[var(--iptv-surface)] backdrop-blur-lg rounded-2xl shadow-2xl border border-white/5">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--iptv-primary)]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[var(--iptv-primary)]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Yönetici Girişi</h1>
          <p className="text-white/40">Frame Yönetim Paneli</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">
              Kullanıcı Adı
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-[var(--iptv-input-bg)] border-white/10 text-white placeholder:text-gray-400 focus:border-[var(--iptv-primary)]"
              placeholder="Admin kullanıcı adı"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Şifre
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[var(--iptv-input-bg)] border-white/10 text-white placeholder:text-gray-400 focus:border-[var(--iptv-primary)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)] text-white font-semibold py-6 transition-colors shadow-lg shadow-[var(--iptv-primary)]/20"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a href="/provider/login" className="text-sm text-white/40 hover:text-white transition-colors">
            Hizmet Sağlayıcı mısınız? Buradan giriş yapın
          </a>
        </div>
      </div>
    </div>
  );
}
