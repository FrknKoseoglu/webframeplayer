'use client';

import { Badge } from '@/components/ui/badge';

type Customer = {
  id: string;
  name: string;
  type: 'XTREAM' | 'M3U';
  expiryDate: Date | null;
  isActive: boolean;
  provider: {
    username: string;
  };
  createdAt: Date;
};

export default function CustomersTable({ customers }: { customers: Customer[] }) {
  const getDaysUntilExpiry = (expiryDate: Date | null) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryBadge = (expiryDate: Date | null) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days === null) return <Badge variant="outline" className="bg-gray-500/20 text-gray-300">Belirtilmemiş</Badge>;
    
    if (days < 0) return <Badge variant="destructive">Süresi Dolmuş</Badge>;
    if (days <= 1) return <Badge variant="destructive">{days} Gün</Badge>;
    if (days <= 7) return <Badge className="bg-orange-500/20 text-orange-300">{days} Gün</Badge>;
    if (days <= 30) return <Badge className="bg-yellow-500/20 text-yellow-300">{days} Gün</Badge>;
    
    return <Badge className="bg-green-500/20 text-green-300">{days} Gün</Badge>;
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Müşteri Adı</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Hizmet Sağlayıcı</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Tip</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Kalan Süre</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Durum</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{customer.name}</td>
                <td className="px-6 py-4 text-purple-300">{customer.provider.username}</td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-300">
                    {customer.type}
                  </Badge>
                </td>
                <td className="px-6 py-4">{getExpiryBadge(customer.expiryDate)}</td>
                <td className="px-6 py-4">
                  {customer.isActive ? (
                    <Badge className="bg-green-500/20 text-green-300">Aktif</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-500/20 text-gray-300">Pasif</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {customers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Henüz müşteri bulunmuyor
          </div>
        )}
      </div>
    </div>
  );
}
