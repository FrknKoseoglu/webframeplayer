import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export default async function SetupPage() {
  async function createAdmin() {
    'use server';
    
    try {
      const existingAdmin = await db.superAdmin.findUnique({
        where: { username: 'admin' },
      });

      if (existingAdmin) {
        return;
      }

      const hashedPassword = await hashPassword('admin123');
      await db.superAdmin.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          email: 'admin@iptv.local',
        },
      });

      redirect('/adm/login?setup=success');
    } catch (error) {
      console.error('Setup error:', error);
    }
  }

  // Check if admin already exists
  const adminExists = await db.superAdmin.findUnique({
    where: { username: 'admin' },
  });

  if (adminExists) {
    redirect('/adm/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">İlk Kurulum</h1>
          <p className="text-gray-300">Yönetici hesabınızı oluşturun</p>
        </div>

        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
          <p className="text-blue-200 text-sm">
            <strong>Varsayılan Kimlik Bilgileri:</strong><br />
            Kullanıcı adı: <code className="bg-black/30 px-2 py-1 rounded">admin</code><br />
            Şifre: <code className="bg-black/30 px-2 py-1 rounded">admin123</code>
          </p>
        </div>

        <form action={createAdmin}>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-lg transition-all"
          >
            Yönetici Hesabı Oluştur
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          ⚠️ Lütfen ilk girişten sonra şifrenizi değiştirin
        </div>
      </div>
    </div>
  );
}
