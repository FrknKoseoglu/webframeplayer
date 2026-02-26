'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link2, Plus, ArrowRight, Trash2, Edit, Copy, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';

type ShortLink = {
  id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
};

export default function ShortLinkManager() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Copy state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/short-links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      } else {
        toast.error('Kısa linkler yüklenemedi');
      }
    } catch (error) {
      toast.error('Bağlantı hatası oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId('');
    setOriginalUrl('');
    setCustomCode('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (link: ShortLink) => {
    setIsEditing(true);
    setEditId(link.id);
    setOriginalUrl(link.originalUrl);
    setCustomCode(link.shortCode);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl) return;

    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        // Update request
        const res = await fetch(`/api/admin/short-links/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ originalUrl }),
        });
        
        if (res.ok) {
          toast.success('Link başarıyla güncellendi');
          fetchLinks();
          setIsDialogOpen(false);
        } else {
          toast.error('Link güncellenirken hata oluştu');
        }
      } else {
        // Create request
        const res = await fetch('/api/admin/short-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ originalUrl, customCode }),
        });
        
        if (res.ok) {
          toast.success('Kısa link başarıyla oluşturuldu');
          fetchLinks();
          setIsDialogOpen(false);
        } else {
          const err = await res.text();
          toast.error(err || 'Link oluşturulurken hata oluştu');
        }
      }
    } catch (error) {
      toast.error('Bağlantı hatası oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu kısa linki silmek istediğinize emin misiniz?')) return;
    
    try {
      const res = await fetch(`/api/admin/short-links/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast.success('Link başarıyla silindi');
        fetchLinks();
      } else {
        toast.error('Link silinirken hata oluştu');
      }
    } catch (error) {
      toast.error('Bağlantı hatası oluştu');
    }
  };

  const handleCopy = (shortCode: string) => {
    const url = `${window.location.origin}/l/${shortCode}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(shortCode);
    toast.success('Link kopyalandı');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[var(--iptv-surface)] p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Link Kısaltıcı</h2>
          <p className="text-white/40">Sistem genelinde kullanılacak kısa linkleri oluşturun ve yönetin.</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary)]/80 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Kısa Link
        </Button>
      </div>

      <div className="bg-[var(--iptv-surface)] border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-white/40">Yükleniyor...</div>
        ) : links.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--iptv-primary)]/10 rounded-full flex items-center justify-center mb-4">
              <Link2 className="w-8 h-8 text-[var(--iptv-primary)]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Henüz Link Yok</h3>
            <p className="text-white/40 mb-6">Sisteminizde hiç kısa link oluşturulmamış.</p>
            <Button onClick={handleOpenCreate} variant="outline" className="border-white/10">
              İlk Linki Oluştur
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium text-white/60">Kısa Link</th>
                  <th className="px-6 py-4 text-sm font-medium text-white/60 w-1/3">Hedef URL</th>
                  <th className="px-6 py-4 text-sm font-medium text-white/60 text-center">Tıklanma</th>
                  <th className="px-6 py-4 text-sm font-medium text-white/60">Oluşturulma</th>
                  <th className="px-6 py-4 text-sm font-medium text-white/60 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[var(--iptv-primary)]/10 text-[var(--iptv-primary)] px-3 py-1 rounded-lg font-mono text-sm font-bold flex items-center gap-2">
                          /l/{link.shortCode}
                          <button onClick={() => handleCopy(link.shortCode)} className="hover:text-white transition-colors">
                            {copiedCode === link.shortCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-[300px]">
                        <span className="text-white/80 truncate">{link.originalUrl}</span>
                        <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[var(--iptv-primary)] flex-shrink-0">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 bg-white/5 rounded text-white/80 font-mono">
                        {link.clicks}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/40">
                      {new Date(link.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          onClick={() => handleOpenEdit(link)}
                          variant="ghost" 
                          size="icon" 
                          className="text-white/40 hover:text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(link.id)}
                          variant="ghost" 
                          size="icon" 
                          className="text-white/40 hover:text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Kısa Linki Düzenle' : 'Yeni Kısa Link Oluştur'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="originalUrl">Hedef URL <span className="text-red-400">*</span></Label>
              <Input
                id="originalUrl"
                type="url"
                required
                placeholder="https://example.com/uzun-bir-url..."
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
              />
              <p className="text-xs text-white/40">Ziyaretçilerin yönlendirileceği orijinal adres.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customCode">Özel Kısa Kod (Opsiyonel)</Label>
              <div className="flex items-center">
                <span className="bg-white/10 border border-white/10 border-r-0 rounded-l-md px-3 py-2 text-white/40 font-mono text-sm">
                  /l/
                </span>
                <Input
                  id="customCode"
                  type="text"
                  placeholder="kampanya2024"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                  disabled={isEditing}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-l-none font-mono"
                />
              </div>
              <p className="text-xs text-white/40">
                {isEditing 
                  ? "Kısa kod oluşturulduktan sonra değiştirilemez." 
                  : "Boş bırakırsanız sistem otomatik rastgele bir kod üretir. Sadece harf, rakam, tire (-) ve alt çizgi (_) kullanın."}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !originalUrl}
                className="bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary)]/80 text-white"
              >
                {isSubmitting ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Oluştur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
