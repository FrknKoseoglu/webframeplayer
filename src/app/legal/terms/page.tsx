'use client';

import { usePlayerStore } from '@/store/usePlayerStore';

export default function TermsPage() {
  const language = usePlayerStore((s) => s.language);

  const termsContent = {
    tr: {
      title: '📄 Kullanım Koşulları (Terms of Service)',
      subtitle: 'Son güncelleme: 14 Haziran 2026',
      sections: [
        {
          title: '1. Yazılımın Tanımı ve Amacı',
          content: 'Bu yazılım, kullanıcıların kendi sağladıkları ağ medya bağlantılarını (örn. M3U/M3U8 çalma listeleri) web tarayıcısı ve masaüstü arayüzü üzerinden oynatmalarını sağlayan, tamamen açık kaynaklı (Open-Source) bir istemcidir. VLC Media Player veya MPC-HC gibi araçların web teknolojileriyle geliştirilmiş alternatifinden ibarettir ve "Kendi İçeriğini Getir" (BYOC) felsefesiyle çalışır.'
        },
        {
          title: '2. Sınırlandırılmış Açık Kaynak Kapsamı',
          content: 'Bu yazılım, merkezi bir platform veya hizmet DEĞİLDİR. Bu kapsamda yazılımın çekirdek kodları ve ana geliştiricisi:\n\n• Herhangi bir medya içeriği, kanal listesi veya yayın aboneliği SAĞLAMAZ, BARINDIRMAZ ve DAĞITMAZ.\n• Yazılıma ait hiçbir dış sunucuda ses, video veya medya materyali işlenmez.\n• Yazılım, dış bağlantıları (URL) tarayıcı veya yerel masaüstü ortamında (Localhost/Electron) çözümlemek ve ekranda oynatmak için tasarlanmış bağımsız bir araçtır.'
        },
        {
          title: '3. Kullanıcı ve Geliştirici Sorumluluğu (Mutlak Sorumluluk Reddi)',
          content: '• Bağımsız Kullanım: Bu proje açık kaynaklı olduğu için, kodların klonlanması (forking), cihazlara kurulması, derlenmesi ve nasıl/hangi amaçla kullanılacağı tamamen kullanıcıların ve diğer geliştiricilerin kendi inisiyatifindedir.\n\n• İçerik Sorumluluğu: Kullanıcılar veya projeyi kendi ortamında barındıran geliştiriciler, yazılıma ekledikleri TÜM bağlantıların ve oynattıkları içeriklerin yasal durumundan, telif hakkı sınırlarından ve kullanım yetkilerinden TEK BAŞLARINA SORUMLUDUR.\n\n• Geliştirici Muafiyeti: Ana geliştirici(ler), yazılımın kaynak kodlarının indirilerek üçüncü şahıslar tarafından yasadışı içeriklerin, telif hakkı ihlallerinin veya yetkisiz erişimlerin bir aracı olarak kullanılmasından hiçbir hukuki, cezai veya mali bağlamda sorumlu tutulamaz.\n\nYazılım "OLDUĞU GİBİ" (AS-IS) sunulmaktadır. Kod tabanının kullanımından doğabilecek her türlü risk, onu indiren veya kendi ortamında (Localhost, sunucu veya masaüstü) derleyerek kullanan kişiye aittir.'
        },
        {
          title: '4. Ticari Kullanım Yasağı',
          content: 'Proje eğitim ve kişisel kullanım amaçlı açık kaynak sunulmuştur. Kodlar veya uygulamanın derlenmiş halleri üçüncü şahıslar tarafından ticari bir ürün, "IPTV kutusu/satış paketi" veya ücretli bir hizmetin parçası olarak satılamaz.'
        }
      ]
    },
    en: {
      title: '📄 Terms of Service',
      subtitle: 'Last updated: June 14, 2026',
      sections: [
        {
          title: '1. Definition and Purpose of the Software',
          content: 'This software is a completely open-source client that allows users to play network media links they provide (e.g., M3U/M3U8 playlists) via web browser and desktop interface. It is merely a web-technology-based alternative to tools like VLC Media Player or MPC-HC and operates on the "Bring Your Own Content" (BYOC) philosophy.'
        },
        {
          title: '2. Scope of Limited Open Source',
          content: 'This software is NOT a centralized platform or service. In this context, the core codes of the software and its main developer:\n\n• Do NOT PROVIDE, HOST, or DISTRIBUTE any media content, channel lists, or subscriptions.\n• Do NOT process any audio, video, or media material on any external servers belonging to the software.\n• The software is an independent tool designed to resolve external links (URLs) in the browser or local desktop environment (Localhost/Electron) and play them on screen.'
        },
        {
          title: '3. User and Developer Responsibility (Absolute Disclaimer of Liability)',
          content: '• Independent Use: Since this project is open-source, cloning (forking) the codes, installing, compiling, and how/for what purpose they are used is entirely at the discretion of the users and other developers.\n\n• Content Responsibility: Users or developers hosting the project in their own environment are SOLELY RESPONSIBLE for the legal status, copyright boundaries, and usage permissions of ALL links they add and content they play.\n\n• Developer Exemption: The main developer(s) cannot be held responsible in any legal, criminal, or financial context for the source codes of the software being downloaded and used by third parties as a tool for illegal content, copyright infringements, or unauthorized access.\n\nThe software is provided "AS-IS". Any risks that may arise from the use of the code base belong to the person who downloads it or compiles and uses it in their own environment (Localhost, server, or desktop).'
        },
        {
          title: '4. Prohibition of Commercial Use',
          content: 'The project is offered open-source for educational and personal use. The codes or compiled versions of the application cannot be sold by third parties as a commercial product, "IPTV box/sales package", or as part of a paid service.'
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
          <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-3">{section.title}</h2>
            <p className="text-white/80 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
