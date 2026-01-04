'use client';

import { usePlayerStore } from '@/store/usePlayerStore';

export default function TermsPage() {
  const language = usePlayerStore((s) => s.language);

  const termsContent = {
    tr: {
      title: 'Kullanım Koşulları',
      subtitle: 'Son güncelleme: 5 Ocak 2025',
      sections: [
        {
          title: '1. Hizmet Tanımı',
          content: 'Frame, kullanıcıların kendi sağladıkları medya URL\'lerini (M3U, Xtream Codes API) web tarayıcısı üzerinden oynatmalarını sağlayan bir "Hizmet Olarak Yazılım" (SaaS) platformudur. Platform, VLC Media Player, MPC-HC veya benzeri masaüstü medya oynatıcılarının web tabanlı bir alternatifidir.'
        },
        {
          title: '2. Hizmetin Kapsamı',
          content: 'Frame:\n• Herhangi bir içerik, kanal listesi veya IPTV aboneliği SATMAZ\n• Kullanıcılara M3U listesi veya Xtream bilgileri SAĞLAMAZ\n• İçerik üretmez, barındırmaz veya dağıtmaz\n• Sadece kullanıcının GİRDİĞİ linkleri oynatmak için teknik bir araçtır'
        },
        {
          title: '3. Yasaklanan Kullanımlar',
          content: 'Platformu aşağıdaki amaçlarla kullanmak KATİ OLARAK YASAKTIR:\n• Telif hakları ihlal edilen korsan içerik izlemek\n• Yasal izni olmadığınız canlı yayınları veya filmleri izlemek\n• Başkalarının IPTV hesaplarını izinsiz kullanmak\n• Platformu yasadışı faaliyetler için kullanmak\n\nBu kurallara uymayan kullanıcıların hesapları kapatılabilir ve IP adresleri engellenebilir.'
        },
        {
          title: '4. Kullanıcı Sorumluluğu',
          content: 'Kullanıcı, platforma girdiği TÜM URL\'lerin, M3U listelerinin ve Xtream bilgilerinin yasal olduğundan ve kullanım hakkına sahip olduğundan emin olmakla TAMAMEN SORUMLUDUR. Platform, kullanıcının izlediği içeriğin yasal durumunu denetlemez.'
        },
        {
          title: '5. Proxy Hizmeti - Teknik Açıklama',
          content: 'Platform, CORS (Cross-Origin Resource Sharing) ve Mixed Content (HTTP/HTTPS) gibi tarayıcı kısıtlamalarını aşmak için opsiyonel bir proxy hizmeti sunar. Bu hizmet:\n• Sadece teknik bir köprüdür (relay)\n• Hiçbir veriyi önbelleğe ALMAZ (No-Cache)\n• Kullanıcı izni ile aktif edilir\n• Korsan içerik izlemek için DEĞİL, tarayıcı uyumluluğu için vardır'
        },
        {
          title: '6. Sorumluluk Reddi',
          content: 'Frame "OLDUĞU GİBİ" (AS-IS) sunulmaktadır. Platform üzerinden izlenen içeriklerin doğası, yasal durumu veya kalitesi hakkında HİÇBİR GARANTİ VERİLMEZ. Platform, kullanıcıların izlediği içeriklerden kaynaklanan herhangi bir yasal, mali veya başka sorunlardan sorumlu TUTULAMAZ.'
        },
        {
          title: '7. Yasal Talepler ve İşbirliği',
          content: 'Telif hakkı sahipleri veya yasal mercilerin talebi halinde, 5651 sayılı "İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun" ve ilgili mevzuat çerçevesinde gerekli bilgileri paylaşırız.\n\nTelif hakkı bildirimi için: oew585p6r@mozmail.com'
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      subtitle: 'Last updated: January 5, 2025',
      sections: [
        {
          title: '1. Service Definition',
          content: 'Frame is a "Software as a Service" (SaaS) platform that allows users to play their own provided media URLs (M3U, Xtream Codes API) through a web browser. The platform is a web-based alternative to desktop media players like VLC Media Player, MPC-HC, or similar applications.'
        },
        {
          title: '2. Service Scope',
          content: 'Frame:\n• Does NOT SELL any content, channel lists, or IPTV subscriptions\n• Does NOT PROVIDE users with M3U lists or Xtream credentials\n• Does not produce, host, or distribute content\n• Is only a technical tool to play links ENTERED by the user'
        },
        {
          title: '3. Prohibited Uses',
          content: 'Using the platform for the following purposes is STRICTLY PROHIBITED:\n• Watching pirated content that infringes copyrights\n• Watching live broadcasts or movies without legal permission\n• Using others\' IPTV accounts without authorization\n• Using the platform for illegal activities\n\nAccounts of users who violate these rules may be closed and IP addresses may be blocked.'
        },
        {
          title: '4. User Responsibility',
          content: 'The user is FULLY RESPONSIBLE for ensuring that ALL URLs, M3U lists, and Xtream credentials entered into the platform are legal and they have the right to use them. The platform does not audit the legal status of the content watched by users.'
        },
        {
          title: '5. Proxy Service - Technical Explanation',
          content: 'The platform offers an optional proxy service to overcome browser restrictions such as CORS (Cross-Origin Resource Sharing) and Mixed Content (HTTP/HTTPS). This service:\n• Is only a technical bridge (relay)\n• Does NOT cache any data (No-Cache)\n• Is activated with user consent\n• Exists for browser compatibility, NOT for watching pirated content'
        },
        {
          title: '6. Disclaimer',
          content: 'Frame is provided "AS-IS". NO WARRANTY is given regarding the nature, legal status, or quality of content watched through the platform. The platform CANNOT BE HELD RESPONSIBLE for any legal, financial, or other issues arising from content watched by users.'
        },
        {
          title: '7. Legal Requests and Cooperation',
          content: 'Upon request from copyright holders or legal authorities, we will share necessary information within the framework of applicable laws (e.g., Turkish Law No. 5651 "Regulation of Publications on the Internet and Combating Crimes Committed through such Publications").\n\nFor copyright notices: oew585p6r@mozmail.com'
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
