'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';

type CalendarEvent = {
  id: string;
  title: string;
  channel: string;
  channelId: string | null;
  eventDate: Date;
  description: string | null;
  createdAt: Date;
};

export default function CalendarManager() {
  const { confirm } = useConfirm();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    channel: '',
    channelId: '',
    eventDate: '',
    description: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/provider/calendar');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/provider/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setFormData({ title: '', channel: '', channelId: '', eventDate: '', description: '' });
        fetchEvents();
        toast.success('Etkinlik oluşturuldu');
      } else {
        toast.error('Hata oluştu');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const proceed = await confirm({
      title: 'Etkinliği Sil',
      description: 'Bu etkinliği silmek istediğinizden emin misiniz?',
      confirmText: 'Sil',
      cancelText: 'İptal',
      type: 'danger',
    });
    if (!proceed) return;

    try {
      await fetch('/api/provider/calendar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      toast.success('Etkinlik silindi');
      fetchEvents();
    } catch (err) {
      toast.error('Hata oluştu');
    }
  };

  if (loading) return <div className="text-white">Yükleniyor...</div>;

  return (
    <>
      <div className="mb-6">
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-pink-600 to-rose-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Etkinlik
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <Calendar className="w-8 h-8 text-pink-300" />
              <Button
                onClick={() => handleDelete(event.id)}
                variant="ghost"
                size="sm"
                className="text-red-300 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-pink-300 font-medium">{event.channel}</p>
              {event.channelId && (
                <code className="text-xs px-2 py-0.5 bg-pink-500/20 text-pink-200 rounded">
                  ID: {event.channelId}
                </code>
              )}
            </div>
            <p className="text-gray-300 text-sm mb-2">
              {new Date(event.eventDate).toLocaleString('tr-TR')}
            </p>
            {event.description && (
              <p className="text-gray-400 text-sm">{event.description}</p>
            )}
          </div>
        ))}

        {events.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            Henüz etkinlik eklenmedi
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Yeni Etkinlik Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="title">Maç / Etkinlik</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: Barcelona vs Real Madrid"
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="channel">Kanal Adı</Label>
                <Input
                  id="channel"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  placeholder="Örn: beIN Sports 1"
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="channelId">Kanal ID (Opsiyonel)</Label>
                <Input
                  id="channelId"
                  value={formData.channelId}
                  onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                  placeholder="Örn: 123456"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="eventDate">Tarih ve Saat</Label>
              <Input
                id="eventDate"
                type="datetime-local"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ek bilgiler..."
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={creating}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600"
            >
              {creating ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
