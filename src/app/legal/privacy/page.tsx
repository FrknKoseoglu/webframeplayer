
'use client';

import { usePlayerStore } from '@/store/usePlayerStore';

export default function PrivacyPage() {
  const language = usePlayerStore((s) => s.language);

  const privacyContent = {
    tr: {
      title: 'Gizlilik Politikası',
      subtitle: 'Verilerinizi nasıl işlediğimiz',
      sections: [
        {
          title: '1. Veri Minimizasyonu Prensibi',
          content: 'Frame, "veri minimizasyonu" prensibini benimser. Sadece platformun çalışması için mutlak gerekli olan verileri işleriz. Gereksiz kişisel veri toplamayız.'
        },
        {
          title: '2. Tarayıcı Tabanlı Depolama (LocalStorage)',
          content: 'Aşağıdaki veriler YALNIZCA tarayıcınızın LocalStorage\'ında saklanır (sunucularımızda DEĞİL):\n• Tema tercihiniz (açık/koyu)\n• Dil tercihiniz (Türkçe/İngilizce)\n• Video oynatıcı ayarları (ses seviyesi, otomatik oynatma vb.)\n• Profil bilgileriniz (sadece tarayıcınızda)\n\nBu veriler hiçbir zaman sunucularımıza aktarılmaz. Tarayıcı önbelleğini temizlediğinizde silinir.'
        },
        {
          title: '3. IPTV Kimlik Bilgileri',
          content: 'IPTV kullanıcı adı ve şifreniz ASLA sunucularımızda saklanmaz. Bu bilgiler sadece tarayıcınızın LocalStorage\'ında tutulur.\n\nİSTİSNA: "Kısa Link" (Magic Link) özelliğini kullanırsanız:\n• Bilgileriniz AES-256 şifreleme ile şifrelenir\n• Benzersiz bir ID ile veritabanımızda saklanır\n• Bu özellik tamamen OPSİYONELDİR ve açık onayınız gerekir\n• İstediğiniz zaman Magic Link\'inizi silebilirsiniz'
        },
        {
          title: '4. Proxy Sunucusu ve Loglar',
          content: 'Proxy hizmetini kullandığınızda:\n• Hiçbir içerik verisi önbelleğe ALINMAZ (No-Cache politikası)\n• Veriler sadece tarayıcınıza anlık olarak aktarılır\n• Sunucu erişim logları sadece güvenlik ve 5651 sayılı yasa gereği tutulur\n• Bu loglar üçüncü taraflarla paylaşılmaz (yasal zorunluluk hariç)'
        },
        {
          title: '5. Çerezler (Cookies)',
          content: 'Platform minimal çerez kullanır:\n• Oturum çerezi (session cookie) - Giriş durumunuzu korur\n• Tercih çerezi - Dil ve tema tercihlerinizi hatırlar\n\nÜçüncü taraf reklam veya takip çerezi KULLANILMAZ.'
        },
        {
          title: '6. Üçüncü Taraf Hizmetler',
          content: 'Platform, aşağıdaki üçüncü taraf hizmetleri kullanır:\n• Cloudflare (CDN ve DDoS koruması)\n• Vercel (Hosting)\n\nBu hizmetler kendi gizlilik politikalarına tabidir.'
        },
        {
          title: '7. Haklarınız (KVKK/GDPR)',
          content: 'Kişisel Verilerin Korunması Kanunu (KVKK) ve GDPR çerçevesinde:\n• Verilerinize erişme hakkınız\n• Verilerin silinmesini isteme hakkınız\n• Verilerin düzeltilmesini isteme hakkınız\n\nBu hakları kullanmak için iletişime geçebilirsiniz.'
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      subtitle: 'How we handle your data',
      sections: [
        {
          title: '1. Data Minimization Principle',
          content: 'Frame adopts the "data minimization" principle. We only process data that is absolutely necessary for the platform to function. We do not collect unnecessary personal data.'
        },
        {
          title: '2. Browser-Based Storage (LocalStorage)',
          content: 'The following data is stored ONLY in your browser\'s LocalStorage (NOT on our servers):\n• Your theme preference (light/dark)\n• Your language preference (Turkish/English)\n• Video player settings (volume, autoplay, etc.)\n• Your profile information (only in your browser)\n\nThis data is never transferred to our servers. It is deleted when you clear your browser cache.'
        },
        {
          title: '3. IPTV Credentials',
          content: 'Your IPTV username and password are NEVER stored on our servers. This information is only kept in your browser\'s LocalStorage.\n\nEXCEPTION: If you use the "Short Link" (Magic Link) feature:\n• Your credentials are encrypted with AES-256 encryption\n• Stored in our database with a unique ID\n• This feature is completely OPTIONAL and requires explicit consent\n• You can delete your Magic Link at any time'
        },
        {
          title: '4. Proxy Server and Logs',
          content: 'When you use the proxy service:\n• No content data is CACHED (No-Cache policy)\n• Data is only instantly transmitted to your browser\n• Server access logs are kept only for security and legal compliance (e.g., Law No. 5651)\n• These logs are not shared with third parties (except legal obligation)'
        },
        {
          title: '5. Cookies',
          content: 'The platform uses minimal cookies:\n• Session cookie - Maintains your login status\n• Preference cookie - Remembers your language and theme preferences\n\nThird-party advertising or tracking cookies are NOT USED.'
        },
        {
          title: '6. Third-Party Services',
          content: 'The platform uses the following third-party services:\n• Cloudflare (CDN and DDoS protection)\n• Vercel (Hosting)\n\nThese services are subject to their own privacy policies.'
        },
        {
          title: '7. Your Rights (KVKK/GDPR)',
          content: 'Under the Personal Data Protection Law (KVKK) and GDPR:\n• Right to access your data\n• Right to request deletion of data\n• Right to request correction of data\n\nYou can contact us to exercise these rights.'
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
