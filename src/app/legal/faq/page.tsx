'use client';

import { usePlayerStore } from '@/store/usePlayerStore';

export default function FAQPage() {
  const language = usePlayerStore((s) => s.language);

  const faqContent = {
    tr: {
      title: 'Sıkça Sorulan Sorular',
      subtitle: 'Yasal Hususlar ve Platform Hakkında',
      faqs: [
        {
          q: 'Kanal satışı yapıyor musunuz veya kanal listesi sağlıyor musunuz?',
          a: 'Hayır, kesinlikle yapmıyoruz. Frame sadece bir medya oynatıcı yazılımdır - tıpkı VLC Player, MPC-HC veya benzeri oynatıcılar gibi. Biz herhangi bir içerik satmıyor, kanal listesi sağlamıyor veya IPTV aboneliği vermiyoruz. Kullanıcılar kendi yasal kaynaklarından aldıkları M3U/Xtream URL\'lerini platforma kendileri ekler. Platform sadece bu linkleri oynatmak için teknik bir araçtır.'
        },
        {
          q: 'Proxy özelliği neden var? Bu korsan içerik için mi?',
          a: 'Hayır. Proxy özelliği tamamen teknik bir gerekliliktir. Modern web tarayıcıları CORS (Cross-Origin Resource Sharing) ve Mixed Content (HTTP/HTTPS karışımı) kısıtlamaları uygular. Bazı IPTV sağlayıcıları HTTP protokolü kullanır, ancak web sitemiz HTTPS üzerinde çalışır - bu da tarayıcıların içeriği engellemesine neden olur. Proxy, bu teknik engeli aşmak için bir köprü görevi görür. ÖNEMLİ: Proxy sunucumuzda hiçbir veri önbelleğe alınmaz (No Cache), veriler sadece anlık olarak tarayıcınıza iletilir.'
        },
        {
          q: 'Yasal sorumluluk kime aittir?',
          a: 'Oynatıcıya girilen her türlü URL, M3U listesi, Xtream bilgileri ve bunlar üzerinden izlenen tüm içeriklerin yasal sorumluluğu %100 kullanıcıya aittir. Frame, bir yazılım aracı olarak, kullanıcının hangi içeriği izlediğini kontrol etmez veya içeriğin yasal durumunu denetlemez. Kullanıcılar, sadece telif haklarına sahip oldukları veya yasal izne sahip içerikleri izlemekle yükümlüdür.'
        },
        {
          q: 'Platform verilerimi saklıyor mu?',
          a: 'Hayır. Tüm tercihleriniz (tema, dil, ayarlar) tarayıcınızın LocalStorage\'ında saklanır. IPTV kullanıcı adı ve şifreniz sunucularımızda saklanmaz. İSTİSNA: "Kısa Link" (Magic Link) özelliğini kullanırsanız, bilgileriniz şifrelenmiş olarak ve benzersiz bir ID ile saklanır - ancak bu tamamen opsiyoneldir ve kullanıcının açık onayı gerektirir.'
        },
        {
          q: 'Telif hakkı ihlali yapan kullanıcılar hakkında ne yapılıyor?',
          a: 'Kullanım şartlarımız, platformun yasadışı içerik izlemek için kullanılmasını açıkça yasaklar. Herhangi bir telif hakkı ihlali veya yasadışı kullanım tespit edildiğinde, kullanıcı hesabını askıya alma veya IP adresini engelleme hakkımızı saklı tutarız. Yasal mercilerin talebi halinde, 5651 sayılı yasaya uygun olarak gerekli bilgileri paylaşırız.'
        }
      ]
    },
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Legal Matters and Platform Information',
      faqs: [
        {
          q: 'Do you sell channels or provide channel lists?',
          a: 'No, absolutely not. Frame is simply a media player software - just like VLC Player, MPC-HC, or similar players. We do not sell any content, provide channel lists, or offer IPTV subscriptions. Users add their own M3U/Xtream URLs from their legal sources. The platform is merely a technical tool to play these links.'
        },
        {
          q: 'Why is there a Proxy feature? Is this for pirated content?',
          a: 'No. The Proxy feature is purely a technical necessity. Modern web browsers enforce CORS (Cross-Origin Resource Sharing) and Mixed Content (HTTP/HTTPS mixing) restrictions. Some IPTV providers use HTTP protocol, but our website runs on HTTPS - causing browsers to block the content. The Proxy acts as a bridge to overcome this technical limitation. IMPORTANT: No data is cached on our proxy server (No Cache), data is only transmitted instantly to your browser.'
        },
        {
          q: 'Who is legally responsible?',
          a: 'The legal responsibility for all URLs, M3U lists, Xtream credentials, and all content watched through them is 100% on the user. Frame, as a software tool, does not control what content users watch or audit the legal status of content. Users are obligated to only watch content they own the rights to or have legal permission to access.'
        },
        {
          q: 'Does the platform store my data?',
          a: 'No. All your preferences (theme, language, settings) are stored in your browser\'s LocalStorage. Your IPTV username and password are NOT stored on our servers. EXCEPTION: If you use the "Short Link" (Magic Link) feature, your credentials are stored encrypted with a unique ID - but this is completely optional and requires explicit user consent.'
        },
        {
          q: 'What happens to users who commit copyright infringement?',
          a: 'Our Terms of Service explicitly prohibit using the platform to watch illegal content. If any copyright infringement or illegal use is detected, we reserve the right to suspend user accounts or block IP addresses. Upon request from legal authorities, we will share necessary information in compliance with applicable laws (e.g., Turkish Law No. 5651).'
        }
      ]
    }
  };

  const content = faqContent[language as 'tr' | 'en'] || faqContent.tr;

  return (
    <div className="prose prose-invert prose-lg max-w-none">
      <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
      <p className="text-white/60 text-lg mb-8">{content.subtitle}</p>

      <div className="space-y-8">
        {content.faqs.map((faq, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-[var(--iptv-primary)] mb-3">
              {faq.q}
            </h3>
            <p className="text-white/80 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-200 font-medium">
          {language === 'tr' 
            ? '⚠️ UYARI: Frame bir yazılım aracıdır. Kullanıcılar, izledikleri içeriklerin yasal olduğundan emin olmakla sorumludur.'
            : '⚠️ WARNING: Frame is a software tool. Users are responsible for ensuring the content they watch is legal.'}
        </p>
      </div>
    </div>
  );
}
