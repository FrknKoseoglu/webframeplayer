'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Sparkles, Trash2, Copy, Save, Settings, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type MagicLink = {
  id: string;
  shortCode: string;
  linkType: string;
  serviceName: string | null;
  message: string;
  logoUrl: string | null;
  clicks: number;
  validUntil: Date | null;
  createdAt: Date;
};

type DefaultSettings = {
  defaultMagicMessage: string;
  defaultMagicLogo: string;
};

export default function MagicLinkManager() {
  const [links, setLinks] = useState<MagicLink[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [defaultSettings, setDefaultSettings] = useState<DefaultSettings>({
    defaultMagicMessage: '',
    defaultMagicLogo: '',
  });

  const [formData, setFormData] = useState({
    linkType: 'XTREAM' as 'XTREAM' | 'M3U',
    m3uUrl: '',
    xtreamHost: '',
    xtreamUser: '',
    xtreamPassword: '',
    serviceName: '',
    message: '',
    logoUrl: '',
    supportUrl: '',
    validUntil: '',
  });

  useEffect(() => {
    fetchLinks();
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

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/provider/magic-links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/provider/magic-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Use default settings if not provided
          message: formData.message || defaultSettings.defaultMagicMessage || 'IPTV hizmetiniz hazır!',
          logoUrl: formData.logoUrl || defaultSettings.defaultMagicLogo || null,
        }),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setFormData({
          linkType: 'XTREAM',
          m3uUrl: '',
          xtreamHost: '',
          xtreamUser: '',
          xtreamPassword: '',
          serviceName: '',
          message: '',
          logoUrl: '',
          supportUrl: '',
          validUntil: '',
        });
        fetchLinks();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu magic linki silmek istediğinizden emin misiniz?')) return;

    try {
      await fetch('/api/provider/magic-links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchLinks();
    } catch (err) {
      alert('Hata oluştu');
    }
  };

  const copyToClipboard = (shortCode: string, id: string) => {
    const magicUrl = `${window.location.origin}/m/${shortCode}`;
    navigator.clipboard.writeText(magicUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="text-white">Yükleniyor...</div>;

  return (
    <>
      {/* Default Settings Section */}
      <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-rose-300" />
          <h2 className="text-xl font-bold text-white">Varsayılan Ayarlar</h2>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Yeni magic link oluşturulurken bu varsayılan değerler kullanılacaktır.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="defaultMessage">Varsayılan Mesaj</Label>
            <textarea
              id="defaultMessage"
              value={defaultSettings.defaultMagicMessage}
              onChange={(e) => setDefaultSettings({ ...defaultSettings, defaultMagicMessage: e.target.value })}
              placeholder="Kullanıcılarınız için varsayılan karşılama mesajı..."
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <Label htmlFor="defaultLogo">Varsayılan Logo URL</Label>
            <Input
              id="defaultLogo"
              type="url"
              value={defaultSettings.defaultMagicLogo}
              onChange={(e) => setDefaultSettings({ ...defaultSettings, defaultMagicLogo: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <Button
            onClick={saveDefaultSettings}
            disabled={savingSettings}
            className="bg-gradient-to-r from-rose-600 to-orange-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {savingSettings ? 'Kaydediliyor...' : settingsSaved ? 'Kaydedildi!' : 'Ayarları Kaydet'}
          </Button>
        </div>
      </div>

      {/* Magic Links List Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Oluşturulan Magic Linkler</h2>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-rose-600 to-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Magic Link
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link) => (
          <div
            key={link.id}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-rose-300" />
                <span className="text-xs px-2 py-1 rounded bg-rose-500/20 text-rose-300">
                  {link.linkType}
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  onClick={() => copyToClipboard(link.shortCode, link.id)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "hover:bg-rose-500/20",
                    copiedId === link.id ? "text-green-300" : "text-rose-300"
                  )}
                >
                  {copiedId === link.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => handleDelete(link.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {link.serviceName && (
              <h3 className="text-white font-semibold mb-2">{link.serviceName}</h3>
            )}
            
            <code className="text-rose-300 font-mono text-sm block mb-3 bg-rose-500/10 px-2 py-1 rounded">
              /m/{link.shortCode}
            </code>
            
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{link.message}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{link.clicks} tıklama</span>
              {link.validUntil && (
                <span>Geçerli: {new Date(link.validUntil).toLocaleDateString('tr-TR')}</span>
              )}
            </div>
          </div>
        ))}

        {links.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
            Henüz magic link oluşturmadınız
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Magic Link Oluştur</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Connection Type Tabs */}
            <Tabs value={formData.linkType} onValueChange={(v) => setFormData({ ...formData, linkType: v as 'XTREAM' | 'M3U' })}>
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="XTREAM">Xtream Codes</TabsTrigger>
                <TabsTrigger value="M3U">M3U Playlist</TabsTrigger>
              </TabsList>

              <TabsContent value="XTREAM" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="xtreamHost">Sunucu Adresi</Label>
                  <Input
                    id="xtreamHost"
                    type="url"
                    value={formData.xtreamHost}
                    onChange={(e) => setFormData({ ...formData, xtreamHost: e.target.value })}
                    placeholder="http://server.com:8080"
                    required={formData.linkType === 'XTREAM'}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="xtreamUser">Kullanıcı Adı</Label>
                    <Input
                      id="xtreamUser"
                      value={formData.xtreamUser}
                      onChange={(e) => setFormData({ ...formData, xtreamUser: e.target.value })}
                      required={formData.linkType === 'XTREAM'}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="xtreamPassword">Şifre</Label>
                    <Input
                      id="xtreamPassword"
                      value={formData.xtreamPassword}
                      onChange={(e) => setFormData({ ...formData, xtreamPassword: e.target.value })}
                      required={formData.linkType === 'XTREAM'}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="M3U" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="m3uUrl">M3U Playlist URL</Label>
                  <Input
                    id="m3uUrl"
                    type="url"
                    value={formData.m3uUrl}
                    onChange={(e) => setFormData({ ...formData, m3uUrl: e.target.value })}
                    placeholder="https://example.com/playlist.m3u"
                    required={formData.linkType === 'M3U'}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Branding Fields */}
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Marka Bilgileri (Opsiyonel)</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="serviceName">Hizmet Adı</Label>
                  <Input
                    id="serviceName"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    placeholder="Premium IPTV"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Özel Mesaj</Label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Hizmetiniz yükleniyor..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportUrl">Destek URL</Label>
                    <Input
                      id="supportUrl"
                      type="url"
                      value={formData.supportUrl}
                      onChange={(e) => setFormData({ ...formData, supportUrl: e.target.value })}
                      placeholder="https://support.example.com"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="validUntil">Geçerlilik Tarihi (Opsiyonel)</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={creating}
              className="w-full bg-gradient-to-r from-rose-600 to-orange-600"
            >
              {creating ? 'Oluşturuluyor...' : 'Magic Link Oluştur'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
