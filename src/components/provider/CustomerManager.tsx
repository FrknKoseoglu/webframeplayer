'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, AlertCircle, Copy, Sparkles, Settings, Save, Check } from 'lucide-react';

type MagicLink = {
  id: string;
  shortCode: string;
};

type Customer = {
  id: string;
  name: string;
  type: 'XTREAM' | 'M3U';
  xtreamUsername?: string | null;
  xtreamPassword?: string | null;
  xtreamHost?: string | null;
  xtreamPort?: string | null;
  m3uUrl?: string | null;
  expiryDate?: Date | null;
  createdAt: Date;
  magicLink?: MagicLink | null;
};

type DefaultSettings = {
  defaultMagicMessage: string;
  defaultMagicLogo: string;
  defaultMagicHost: string;
};

type Props = {
  customers: Customer[];
  currentCount: number;
  userLimit: number;
};

export default function CustomerManager({ customers, currentCount, userLimit }: Props) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [defaultSettings, setDefaultSettings] = useState<DefaultSettings>({
    defaultMagicMessage: '',
    defaultMagicLogo: '',
    defaultMagicHost: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    type: 'XTREAM' as 'XTREAM' | 'M3U',
    xtreamUsername: '',
    xtreamPassword: '',
    xtreamHost: '',
    m3uUrl: '',
    expiryDate: '',
    createMagicLink: true,
    customMessage: '',
    customLogo: '',
  });

  useEffect(() => {
    fetchDefaultSettings();
  }, []);

  const fetchDefaultSettings = async () => {
    try {
      const res = await fetch('/api/provider/magic-link-settings');
      if (res.ok) {
        const data = await res.json();
        setDefaultSettings({
          defaultMagicMessage: data.defaultMagicMessage || '',
          defaultMagicLogo: data.defaultMagicLogo || '',
          defaultMagicHost: data.defaultMagicHost || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const saveDefaultSettings = async () => {
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      const res = await fetch('/api/provider/magic-link-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultSettings),
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (err) {
      alert('Ayarlar kaydedilemedi');
    } finally {
      setSavingSettings(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'XTREAM',
      xtreamUsername: '',
      xtreamPassword: '',
      xtreamHost: defaultSettings.defaultMagicHost || '',
      m3uUrl: '',
      expiryDate: '',
      createMagicLink: true,
      customMessage: '',
      customLogo: '',
    });
    setError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/provider/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customMessage: formData.customMessage || null,
          customLogo: formData.customLogo || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsCreateOpen(false);
        resetForm();
        router.refresh();
      } else {
        setError(data.error || 'Hata oluştu');
      }
    } catch (err) {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/provider/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCustomer.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEditingCustomer(null);
        resetForm();
        router.refresh();
      } else {
        setError(data.error || 'Hata oluştu');
      }
    } catch (err) {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch('/api/provider/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      alert('Hata oluştu');
    }
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    let hostWithPort = customer.xtreamHost || '';
    if (customer.xtreamHost && customer.xtreamPort) {
      if (!customer.xtreamHost.includes(':' + customer.xtreamPort)) {
        hostWithPort = `${customer.xtreamHost}:${customer.xtreamPort}`;
      }
    }
    setFormData({
      name: customer.name,
      type: customer.type,
      xtreamUsername: customer.xtreamUsername || '',
      xtreamPassword: customer.xtreamPassword || '',
      xtreamHost: hostWithPort,
      m3uUrl: customer.m3uUrl || '',
      expiryDate: customer.expiryDate ? new Date(customer.expiryDate).toISOString().split('T')[0] : '',
      createMagicLink: false,
      customMessage: '',
      customLogo: '',
    });
  };

  const copyMagicLink = (shortCode: string, customerId: string) => {
    const magicUrl = `${window.location.origin}/m/${shortCode}`;
    navigator.clipboard.writeText(magicUrl);
    setCopiedId(customerId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDaysUntilExpiry = (expiryDate: Date | null | undefined) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryBadge = (expiryDate: Date | null | undefined) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days === null) return <span className="text-zinc-500">-</span>;
    if (days < 0) return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Süresi Doldu</Badge>;
    if (days <= 7) return <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">{days} Gün</Badge>;
    if (days <= 30) return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">{days} Gün</Badge>;
    return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">{days} Gün</Badge>;
  };

  const canAddMore = currentCount < userLimit;

  // Input styling consistent with site design
  const inputStyles = "bg-[var(--iptv-surface)]/50 border-white/10 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20";
  const labelStyles = "text-zinc-300 text-sm font-medium mb-2 block";

  return (
    <>
      {/* Header with buttons */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="text-white">
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{currentCount}</span>
          <span className="text-zinc-400"> / {userLimit} Kullanıcı</span>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsSettingsOpen(true)}
            variant="outline"
            className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Varsayılan Değerler
          </Button>
          <Button
            onClick={() => {
              if (canAddMore) {
                resetForm();
                setIsCreateOpen(true);
              } else {
                alert('Kullanıcı limitinize ulaştınız. Yöneticinizle iletişime geçin.');
              }
            }}
            disabled={!canAddMore}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Kullanıcı
          </Button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-[var(--iptv-surface)]/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Ad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Tip</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Kullanıcı</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Host</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Magic Link</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Kalan Süre</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-300">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{customer.name}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                      {customer.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm font-mono">
                    {customer.type === 'XTREAM' ? customer.xtreamUsername || '-' : '-'}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm font-mono truncate max-w-[200px]">
                    {customer.type === 'XTREAM' 
                      ? (customer.xtreamHost ? `${customer.xtreamHost}${customer.xtreamPort ? ':' + customer.xtreamPort : ''}` : '-')
                      : (customer.m3uUrl ? 'M3U' : '-')}
                  </td>
                  <td className="px-6 py-4">
                    {customer.magicLink ? (
                      <div className="flex items-center gap-2">
                        <code className="text-purple-300 font-mono text-xs bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                          /m/{customer.magicLink.shortCode}
                        </code>
                        <Button
                          onClick={() => copyMagicLink(customer.magicLink!.shortCode, customer.id)}
                          variant="ghost"
                          size="sm"
                          className={`${copiedId === customer.id ? 'text-emerald-400' : 'text-purple-300'} hover:bg-purple-500/10`}
                        >
                          {copiedId === customer.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-zinc-600 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{getExpiryBadge(customer.expiryDate)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        onClick={() => openEdit(customer)}
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(customer.id)}
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {customers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-500">
                    Henüz kullanıcı eklenmedi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Default Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-[var(--iptv-surface)] border-white/10 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-purple-400" />
              Varsayılan Magic Link Değerleri
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <p className="text-zinc-400 text-sm">
              Yeni kullanıcı eklerken bu değerler varsayılan olarak kullanılacaktır.
            </p>
            
            <div>
              <Label htmlFor="defaultHost" className={labelStyles}>Varsayılan Host (port dahil)</Label>
              <Input
                id="defaultHost"
                value={defaultSettings.defaultMagicHost}
                onChange={(e) => setDefaultSettings({ ...defaultSettings, defaultMagicHost: e.target.value })}
                placeholder="http://server.com:8080"
                className={inputStyles}
              />
            </div>
            
            <div>
              <Label htmlFor="defaultMessage" className={labelStyles}>Varsayılan Mesaj</Label>
              <textarea
                id="defaultMessage"
                value={defaultSettings.defaultMagicMessage}
                onChange={(e) => setDefaultSettings({ ...defaultSettings, defaultMagicMessage: e.target.value })}
                placeholder="Kullanıcılarınız için varsayılan karşılama mesajı..."
                rows={3}
                className="w-full px-3 py-2 bg-[var(--iptv-surface)]/50 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
            
            <div>
              <Label htmlFor="defaultLogo" className={labelStyles}>Varsayılan Logo URL</Label>
              <Input
                id="defaultLogo"
                type="url"
                value={defaultSettings.defaultMagicLogo}
                onChange={(e) => setDefaultSettings({ ...defaultSettings, defaultMagicLogo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className={inputStyles}
              />
            </div>
            
            <Button
              onClick={saveDefaultSettings}
              disabled={savingSettings}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-11"
            >
              <Save className="w-4 h-4 mr-2" />
              {savingSettings ? 'Kaydediliyor...' : settingsSaved ? 'Kaydedildi!' : 'Kaydet'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Customer Dialog */}
      <Dialog open={isCreateOpen || !!editingCustomer} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingCustomer(null);
          resetForm();
        }
      }}>
        <DialogContent className="bg-[var(--iptv-surface)] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg">{editingCustomer ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editingCustomer ? handleUpdate : handleCreate} className="space-y-5 pt-2">
            <div>
              <Label htmlFor="name" className={labelStyles}>Kullanıcı Adı</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className={inputStyles}
              />
            </div>

            <Tabs value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as 'XTREAM' | 'M3U' })}>
              <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                <TabsTrigger value="XTREAM" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Xtream Codes</TabsTrigger>
                <TabsTrigger value="M3U" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">M3U Playlist</TabsTrigger>
              </TabsList>

              <TabsContent value="XTREAM" className="space-y-4 mt-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="xtreamUsername" className={labelStyles}>Kullanıcı Adı</Label>
                    <Input
                      id="xtreamUsername"
                      value={formData.xtreamUsername}
                      onChange={(e) => setFormData({ ...formData, xtreamUsername: e.target.value })}
                      required={formData.type === 'XTREAM'}
                      className={inputStyles}
                    />
                  </div>
                  <div>
                    <Label htmlFor="xtreamPassword" className={labelStyles}>Şifre</Label>
                    <Input
                      id="xtreamPassword"
                      value={formData.xtreamPassword}
                      onChange={(e) => setFormData({ ...formData, xtreamPassword: e.target.value })}
                      required={formData.type === 'XTREAM'}
                      className={inputStyles}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="xtreamHost" className={labelStyles}>Host (port dahil)</Label>
                  <Input
                    id="xtreamHost"
                    value={formData.xtreamHost}
                    onChange={(e) => setFormData({ ...formData, xtreamHost: e.target.value })}
                    required={formData.type === 'XTREAM'}
                    placeholder="http://server.com:8080"
                    className={inputStyles}
                  />
                </div>
              </TabsContent>

              <TabsContent value="M3U" className="space-y-4 mt-5">
                <div>
                  <Label htmlFor="m3uUrl" className={labelStyles}>M3U URL</Label>
                  <Input
                    id="m3uUrl"
                    value={formData.m3uUrl}
                    onChange={(e) => setFormData({ ...formData, m3uUrl: e.target.value })}
                    required={formData.type === 'M3U'}
                    placeholder="http://server.com/playlist.m3u8"
                    className={inputStyles}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div>
              <Label htmlFor="expiryDate" className={labelStyles}>Bitiş Tarihi (Opsiyonel)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className={inputStyles}
              />
            </div>

            {/* Magic Link Options - only show on create */}
            {!editingCustomer && (
              <>
                <div className="flex items-center gap-3 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                  <input
                    type="checkbox"
                    id="createMagicLink"
                    checked={formData.createMagicLink}
                    onChange={(e) => setFormData({ ...formData, createMagicLink: e.target.checked })}
                    className="w-5 h-5 rounded border-purple-500/50 bg-white/10 text-purple-500 focus:ring-purple-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="createMagicLink" className="text-white font-medium cursor-pointer flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Magic Link Oluştur
                    </label>
                    <p className="text-zinc-500 text-sm">
                      Kullanıcı için paylaşılabilir magic link oluşturulur
                    </p>
                  </div>
                </div>

                {/* Custom Message/Logo - only if creating magic link */}
                {formData.createMagicLink && (
                  <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-sm text-zinc-400 font-medium">Özel Magic Link Ayarları (Opsiyonel)</p>
                    
                    <div>
                      <Label htmlFor="customMessage" className={labelStyles}>Özel Mesaj</Label>
                      <textarea
                        id="customMessage"
                        value={formData.customMessage}
                        onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                        placeholder={defaultSettings.defaultMagicMessage || 'Varsayılan mesaj kullanılacak...'}
                        rows={2}
                        className="w-full px-3 py-2 bg-[var(--iptv-surface)]/50 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customLogo" className={labelStyles}>Özel Logo URL</Label>
                      <Input
                        id="customLogo"
                        type="url"
                        value={formData.customLogo}
                        onChange={(e) => setFormData({ ...formData, customLogo: e.target.value })}
                        placeholder={defaultSettings.defaultMagicLogo || 'Varsayılan logo kullanılacak...'}
                        className={`${inputStyles} text-sm`}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-11"
            >
              {loading ? 'Kaydediliyor...' : editingCustomer ? 'Güncelle' : 'Ekle'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
