
'use client';

import { usePlayerStore } from '@/store/usePlayerStore';

export default function PrivacyPage() {
  const language = usePlayerStore((s) => s.language);

  const privacyContent = {
    tr: {
      title: 'Gizlilik Politikası',
      subtitle: 'Son güncelleme: 25 Şubat 2026',
      sections: [
        {
          title: '1. Veri Minimizasyonu Prensibi',
          content: 'Frame, "veri minimizasyonu" prensibini katı bir şekilde uygular. Sadece oynatıcının temel işlevlerini yerine getirmesi için teknik olarak zorunlu olan minimum veriyi işleriz. Kullanıcıların izleme alışkanlıkları veya medya tercihleri profillenmez veya kaydedilmez.'
        },
        {
          title: '2. Tarayıcı Tabanlı Depolama (Sıfır Sunucu İzi)',
          content: 'Aşağıdaki veriler YALNIZCA sizin kendi cihazınızın/tarayıcınızın yerel hafızasında (LocalStorage) saklanır ve asla sunucularımıza iletilmez:\n\n• Tema ve dil tercihleri (Açık/Koyu, TR/EN).\n• Oynatıcı yapılandırmaları (Ses seviyesi, ekran oranı, otomatik oynatma).\n• İzleme geçmişi ve cihaza eklenen kişisel bağlantılar.\n\nBu veriler üzerinde tam kontrole sahipsiniz ve tarayıcı önbelleğinizi temizlediğiniz an tümü kalıcı olarak yok olur.'
        },
        {
          title: '3. Çerezler (Cookies) ve İzleyiciler',
          content: 'Platformumuz, kullanıcıları internette takip eden, reklam profili çıkartan veya üçüncü parti pazarlama şirketlerine veri satan (Tracking/Marketing Cookies) HİÇBİR çerez kullanmaz. Sadece oynatıcı arayüz tercihlerini hatırlamak için zaruri (Essential) yerel veriler kullanılır.'
        },
        {
          title: '4. Üçüncü Taraf Altyapılar',
          content: 'Platformun kesintisiz ve güvenli çalışması için global altyapı sağlayıcıları kullanılır:\n\n• Cloudflare (Siber güvenlik, DNS ve CDN)\n• Vercel (Uygulama barındırma)\n\nBu servisler, verileri kendi katı güvenlik ve gizlilik politikaları çerçevesinde işler.'
        },
        {
          title: '5. Yasal Haklarınız (KVKK & GDPR)',
          content: 'Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Genel Veri Koruma Yönetmeliği (GDPR) kapsamında; sistemlerimizde (eğer var ise) tutulan verilerinize erişme, bu verilerin kullanım amacını öğrenme, anonimleştirilmesini veya tamamen silinmesini (Unutulma Hakkı) talep etme hakkına sahipsiniz.\n\nTalepleriniz için iletişim: oew585p6r@mozmail.com'
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      subtitle: 'Last updated: February 25, 2026',
      sections: [
        {
          title: '1. Data Minimization Principle',
          content: "Frame strictly applies the 'data minimization' principle. We only process the minimum data technically necessary for the player to perform its basic functions. Users' viewing habits or media preferences are not profiled or recorded."
        },
        {
          title: '2. Browser-Based Storage (Zero Server Trace)',
          content: "The following data is stored ONLY in your own device's/browser's local memory (LocalStorage) and is never transmitted to our servers:\n\n• Theme and language preferences (Light/Dark, TR/EN).\n• Player configurations (Volume level, aspect ratio, autoplay).\n• Viewing history and personal links added to the device.\n\nYou have full control over this data, and the moment you clear your browser cache, it is all permanently destroyed."
        },
        {
          title: '3. Cookies and Trackers',
          content: 'Our platform does NOT use any cookies that track users on the internet, create advertising profiles, or sell data to third-party marketing companies (Tracking/Marketing Cookies). Only essential local data is used to remember player interface preferences.'
        },
        {
          title: '4. Third-Party Infrastructures',
          content: 'Global infrastructure providers are used for the continuous and secure operation of the platform:\n\n• Cloudflare (Cybersecurity, DNS, and CDN)\n• Vercel (App hosting)\n\nThese services process data within the framework of their own strict security and privacy policies.'
        },
        {
          title: '5. Your Legal Rights (KVKK & GDPR)',
          content: 'Within the scope of the Personal Data Protection Law (KVKK) and the European General Data Protection Regulation (GDPR); you have the right to access your data held in our systems (if any), learn the purpose of use of this data, request its anonymization or complete deletion (Right to be Forgotten).\n\nFor your requests contact: oew585p6r@mozmail.com'
        }
      ]
    }
  };

  const content = privacyContent[language as 'tr' | 'en'] || privacyContent.tr;

  return (
    <div className="prose prose-invert prose-lg max-w-none">
      <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
      <p className="text-white/60 text-lg mb-8">{content.subtitle}</p>

      <div className="space-y-8">
        {content.sections.map((section, index) => (
          <div key={index}>
            <h2 className="text-2xl font-bold text-white mb-3">{section.title}</h2>
            <p className="text-white/80 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h3 className="text-blue-400 font-bold text-xl mb-2">
          {language === 'tr' ? 'Gizliliğiniz Bizim İçin Önemlidir' : 'Your Privacy Matters to Us'}
        </h3>
        <p className="text-blue-200">
          {language === 'tr'
            ? 'Sormak istediğiniz herhangi bir gizlilik sorunuz varsa, lütfen bizimle iletişime geçin. Verilerinizin güvende olduğundan emin olmak için sürekli çalışıyoruz.'
            : 'If you have any privacy questions, please contact us. We are constantly working to ensure your data is secure.'}
        </p>
      </div>
    </div>
  );
}
