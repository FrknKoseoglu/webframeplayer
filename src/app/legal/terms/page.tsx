
'use client';

import { usePlayerStore } from '@/store/usePlayerStore';

export default function TermsPage() {
  const language = usePlayerStore((s) => s.language);

  const termsContent = {
    tr: {
      title: 'Kullanım Koşulları',
      subtitle: 'Son güncelleme: 25 Şubat 2026',
      sections: [
        {
          title: '1. Hizmet Tanımı',
          content: "Frame, kullanıcıların kendi sağladıkları ağ medya bağlantılarını (örn. M3U çalma listeleri, Uzaktan Medya API'leri) web tarayıcısı ve masaüstü arayüzü üzerinden oynatmalarını sağlayan, \"İçerik Sağlayıcıdan Bağımsız\" (BYOC - Bring Your Own Content) bir medya oynatıcı aracıdır. Platform; VLC Media Player, MPC-HC veya benzeri yerel masaüstü medya oynatıcılarının web tabanlı bir alternatifinden ibarettir."
        },
        {
          title: '2. Hizmetin Kapsamı (ÖNEMLİ)',
          content: "Frame bir içerik platformu DEĞİLDİR. Bu kapsamda Frame:\n\n• Herhangi bir medya içeriği, kanal listesi, film, dizi veya yayın aboneliği SATMAZ.\n• Kullanıcıcılara hazır çalma listeleri veya sunucu erişim bilgileri SAĞLAMAZ.\n• Kendi sunucularında hiçbir ses veya video materyali üretmez, barındırmaz veya dağıtmaz.\n• Sadece ve sadece kullanıcının KENDİ İRADESİYLE GİRDİĞİ dış bağlantıları (URL) ekranda oynatmak için geliştirilmiş tarafsız bir yazılım aracıdır."
        },
        {
          title: '3. Kullanıcı Sorumluluğu (Sorumluluk Reddi)',
          content: 'Kullanıcı, Frame oynatıcısına eklediği TÜM bağlantıların (URL, çalma listeleri, API giriş bilgileri) yasal olduğundan, telif hakkı ihlali içermediğinden ve bu içerikleri kişisel kullanım hakkına sahip olduğundan emin olmakla TAMAMEN VE TEK BAŞINA SORUMLUDUR. Frame yazılımı, kullanıcının dış kaynaklardan çektiği içeriğin yasal durumunu, lisansını veya güvenliğini denetlemez ve bu konuda doğabilecek hiçbir hukuki, cezai veya mali sonuçtan sorumlu tutulamaz. Frame "OLDUĞU GİBİ" (AS-IS) sunulmaktadır.'
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      subtitle: 'Last updated: February 25, 2026',
      sections: [
        {
          title: '1. Service Definition',
          content: "Frame is a 'Bring Your Own Content' (BYOC) media player tool that allows users to play their own network media links (e.g., M3U playlists, Remote Media APIs) via web browser and desktop interface. The platform is merely a web-based alternative to local desktop media players like VLC Media Player, MPC-HC, or similar."
        },
        {
          title: '2. Scope of Service (IMPORTANT)',
          content: "Frame is NOT a content platform. In this context, Frame:\n\n• Does NOT SELL any media content, channel lists, movies, series, or broadcast subscriptions.\n• Does NOT PROVIDE users with ready-made playlists or server access information.\n• Does NOT produce, host, or distribute any audio or video material on its own servers.\n• Is ONLY a neutral software tool developed to play external links (URLs) entered by the user of their OWN WILL on the screen."
        },
        {
          title: '3. User Responsibility (Disclaimer)',
          content: "The user is SOLELY AND FULLY RESPONSIBLE for ensuring that ALL links (URLs, playlists, API credentials) added to the Frame player are legal, do not contain copyright infringement, and that they have the right to personal use of these contents. Frame software does not audit the legal status, license, or security of the content pulled from external sources by the user and cannot be held responsible for any legal, criminal, or financial consequences that may arise. Frame is provided 'AS-IS'."
        }
      ]
    }
  };

  const content = termsContent[language as 'tr' | 'en'] || termsContent.tr;

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

      <div className="mt-12 p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
        <h3 className="text-red-400 font-bold text-xl mb-2">
          {language === 'tr' ? 'ÖNEMLİ UYARI' : 'IMPORTANT WARNING'}
        </h3>
        <p className="text-red-200">
          {language === 'tr'
            ? 'Bu platformu kullanarak, yukarıdaki koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. Telif hakkı ihlali veya yasadışı kullanım tespit edildiğinde hesabınız kapatılabilir ve yasal işlem başlatılabilir.'
            : 'By using this platform, you declare that you have read, understood, and accepted the above terms. If copyright infringement or illegal use is detected, your account may be closed and legal action may be initiated.'}
        </p>
      </div>
    </div>
  );
}
