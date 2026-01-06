'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Bell } from 'lucide-react';

type Notification = {
  id: string;
  title: string;
  message: string;
  targetType: 'ALL_CUSTOMERS' | 'SPECIFIC_CUSTOMERS';
  createdAt: Date;
};

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'ALL_CUSTOMERS' as 'ALL_CUSTOMERS' | 'SPECIFIC_CUSTOMERS',
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/provider/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/provider/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setFormData({ title: '', message: '', targetType: 'ALL_CUSTOMERS' });
        fetchNotifications();
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="text-white">Yükleniyor...</div>;

  return (
    <>
      <div className="mb-6">
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Duyuru
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <Bell className="w-6 h-6 text-indigo-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{notification.title}</h3>
                <p className="text-gray-300 mb-3">{notification.message}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{new Date(notification.createdAt).toLocaleString('tr-TR')}</span>
                  <span>•</span>
                  <span>{notification.targetType === 'ALL_CUSTOMERS' ? 'Tüm Kullanıcılar' : 'Seçili Kullanıcılar'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
            Henüz duyuru gönderilmedi
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Yeni Duyuru Gönder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: Hizmet Güncellemesi"
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="message">Mesaj</Label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Duyuru mesajınızı buraya yazın..."
                required
                rows={4}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button
              type="submit"
              disabled={creating}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600"
            >
              {creating ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
