'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash2, Users, Plus } from 'lucide-react';

type Provider = {
  id: string;
  username: string;
  email: string | null;
  userLimit: number;
  createdAt: Date;
  _count: {
    customers: number;
  };
};

export default function ProvidersList({ providers }: { providers: Provider[] }) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    userLimit: 10,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setFormData({ username: '', password: '', email: '', userLimit: 10 });
        router.refresh();
      } else {
        alert('Hata oluştu');
      }
    } catch (err) {
      alert('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProvider.id,
          userLimit: formData.userLimit,
          email: formData.email,
          password: formData.password || undefined, // Only send if not empty
        }),
      });

      if (res.ok) {
        setEditingProvider(null);
        router.refresh();
      } else {
        alert('Hata oluştu');
      }
    } catch (err) {
      alert('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hizmet sağlayıcıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Hata oluştu');
      }
    } catch (err) {
      alert('Hata oluştu');
    }
  };

  const openEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      username: provider.username,
      password: '',
      email: provider.email || '',
      userLimit: provider.userLimit,
    });
  };

  return (
    <>
      <div className="mb-6">
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Hizmet Sağlayıcı
        </Button>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Kullanıcı Adı</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">E-posta</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Müşteri / Limit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-200">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {providers.map((provider) => (
                <tr key={provider.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{provider.username}</td>
                  <td className="px-6 py-4 text-gray-300">{provider.email || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-300" />
                      <span className="text-white">
                        {provider._count.customers} / {provider.userLimit}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(provider.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => openEdit(provider)}
                        variant="ghost"
                        size="sm"
                        className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/20"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(provider.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-300 hover:text-red-200 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {providers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Henüz hizmet sağlayıcı bulunmuyor
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Yeni Hizmet Sağlayıcı</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="email">E-posta (Opsiyonel)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="userLimit">Müşteri Limiti</Label>
              <Input
                id="userLimit"
                type="number"
                value={formData.userLimit}
                onChange={(e) => setFormData({ ...formData, userLimit: Number(e.target.value) })}
                required
                min={1}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProvider} onOpenChange={() => setEditingProvider(null)}>
        <DialogContent className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Hizmet Sağlayıcıyı Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label>Kullanıcı Adı</Label>
              <Input
                value={formData.username}
                disabled
                className="bg-white/5 border-white/20 text-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">E-posta</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-password">Şifre (Değiştirmek için doldurun)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Yeni şifre girin..."
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-userLimit">Müşteri Limiti</Label>
              <Input
                id="edit-userLimit"
                type="number"
                value={formData.userLimit}
                onChange={(e) => setFormData({ ...formData, userLimit: Number(e.target.value) })}
                required
                min={1}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
