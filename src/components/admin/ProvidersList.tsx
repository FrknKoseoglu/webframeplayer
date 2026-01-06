'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash2, Users, Plus, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';

type Provider = {
  id: string;
  username: string;
  email: string | null;
  credits: number;
  userLimit: number;
  createdAt: Date;
  _count: {
    customers: number;
  };
};

export default function ProvidersList({ providers }: { providers: Provider[] }) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [creditProvider, setCreditProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);
  const [creditAmount, setCreditAmount] = useState(10);
  const [creditDescription, setCreditDescription] = useState('');

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
        toast.success('Servis sağlayıcı oluşturuldu');
      } else {
        toast.error('Hata oluştu');
      }
    } catch (err) {
      toast.error('Hata oluştu');
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
        toast.success('Servis sağlayıcı güncellendi');
      } else {
        toast.error('Hata oluştu');
      }
    } catch (err) {
      toast.error('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const proceed = await confirm({
      title: 'Hizmet Sağlayıcıyı Sil',
      description: 'Bu hizmet sağlayıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      confirmText: 'Sil',
      cancelText: 'İptal',
      type: 'danger',
    });
    if (!proceed) return;
    
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success('Servis sağlayıcı silindi');
        router.refresh();
      } else {
        toast.error('Hata oluştu');
      }
    } catch (err) {
      toast.error('Hata oluştu');
    }
  };

  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditProvider) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: creditProvider.id,
          amount: creditAmount,
          description: creditDescription || `${creditAmount} kredi eklendi`,
        }),
      });

      if (res.ok) {
        setCreditProvider(null);
        setCreditAmount(10);
        setCreditDescription('');
        router.refresh();
        toast.success(`${creditAmount} kredi başarıyla eklendi!`);
      } else {
        toast.error('Kredi ekleme başarısız');
      }
    } catch (err) {
      toast.error('Hata oluştu');
    } finally {
      setLoading(false);
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

  // Input styling consistent with site design
  const inputStyles = "bg-[var(--iptv-input-bg)] border-white/10 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20";
  const labelStyles = "text-zinc-300 text-sm font-medium mb-2 block";
  const dialogContentStyles = "bg-[var(--iptv-surface)] border-white/10 text-white backdrop-blur-xl sm:max-w-[500px]";

  return (
    <>
      <div className="mb-6">
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Hizmet Sağlayıcı
        </Button>
      </div>

      <div className="bg-[var(--iptv-surface)]/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Kullanıcı Adı</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">E-posta</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Kullanıcı</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Bakiye</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-300">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {providers.map((provider) => (
                <tr key={provider.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{provider.username}</td>
                  <td className="px-6 py-4 text-zinc-400">{provider.email || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-white">{provider._count.customers}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">{provider.credits}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {new Date(provider.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        onClick={() => setCreditProvider(provider)}
                        variant="ghost"
                        size="sm"
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        title="Kredi Ekle"
                      >
                        <Coins className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => openEdit(provider)}
                        variant="ghost"
                        size="sm"
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                        title="Düzenle"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(provider.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        title="Sil"
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
            <div className="text-center py-16 text-zinc-500">
              Henüz hizmet sağlayıcı bulunmuyor
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className={dialogContentStyles}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              Yeni Hizmet Sağlayıcı
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="username" className={labelStyles}>Kullanıcı Adı</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className={inputStyles}
                placeholder="Örn: provider1"
              />
            </div>
            <div>
              <Label htmlFor="password" className={labelStyles}>Şifre</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className={inputStyles}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label htmlFor="email" className={labelStyles}>E-posta (Opsiyonel)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputStyles}
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <Label htmlFor="userLimit" className={labelStyles}>Müşteri Limiti</Label>
              <Input
                id="userLimit"
                type="number"
                value={formData.userLimit}
                onChange={(e) => setFormData({ ...formData, userLimit: Number(e.target.value) })}
                required
                min={1}
                className={inputStyles}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-11 shadow-lg shadow-purple-500/20"
            >
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProvider} onOpenChange={() => setEditingProvider(null)}>
        <DialogContent className={dialogContentStyles}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Pencil className="w-5 h-5 text-purple-400" />
              Hizmet Sağlayıcıyı Düzenle
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div>
              <Label className={labelStyles}>Kullanıcı Adı</Label>
              <Input
                value={formData.username}
                disabled
                className={`${inputStyles} opacity-60 cursor-not-allowed`}
              />
            </div>
            <div>
              <Label htmlFor="edit-email" className={labelStyles}>E-posta</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputStyles}
              />
            </div>
            <div>
              <Label htmlFor="edit-password" className={labelStyles}>Şifre (Değiştirmek için doldurun)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Yeni şifre..."
                className={inputStyles}
              />
            </div>
            <div>
              <Label htmlFor="edit-userLimit" className={labelStyles}>Müşteri Limiti</Label>
              <Input
                id="edit-userLimit"
                type="number"
                value={formData.userLimit}
                onChange={(e) => setFormData({ ...formData, userLimit: Number(e.target.value) })}
                required
                min={1}
                className={inputStyles}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-11 shadow-lg shadow-purple-500/20"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credit Dialog */}
      <Dialog open={!!creditProvider} onOpenChange={() => setCreditProvider(null)}>
        <DialogContent className={dialogContentStyles}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              Kredi Ekle - <span className="text-purple-400">{creditProvider?.username}</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCredits} className="space-y-4 pt-2">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
              <span className="text-emerald-200 text-sm font-medium">Mevcut Bakiye</span>
              <span className="text-2xl font-bold text-emerald-400">{creditProvider?.credits} <span className="text-sm font-normal text-emerald-500/70">Kredi</span></span>
            </div>
            
            <div>
              <Label htmlFor="credit-amount" className={labelStyles}>Eklenecek Kredi</Label>
              <Input
                id="credit-amount"
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                required
                min={1}
                placeholder="Örn: 50"
                className={inputStyles}
              />
            </div>
            <div>
              <Label htmlFor="credit-description" className={labelStyles}>Açıklama (Opsiyonel)</Label>
              <Input
                id="credit-description"
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                placeholder="Örn: Ödeme alındı"
                className={inputStyles}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-11 shadow-lg shadow-emerald-500/20"
            >
              {loading ? 'Ekleniyor...' : `${creditAmount} Kredi Ekle`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
