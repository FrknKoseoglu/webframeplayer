'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles, Shield, Link2, Image, HelpCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MagicLinkFAQ() {
  const faqs = [
    {
      icon: HelpCircle,
      question: "Magic Link nedir?",
      answer: "Magic Link, IPTV hizmet sağlayıcılarının müşterilerine tek tıkla hizmet sunmasını sağlayan bir özelliktir. Karmaşık kurulum adımlarını ortadan kaldırır ve müşteri deneyimini iyileştirir."
    },
    {
      icon: Link2,
      question: "Nasıl çalışır?",
      answer: "Hizmet sağlayıcı, Magic Link oluşturma aracını kullanarak özel bir link oluşturur. Bu link, sunucu bilgileri, kullanıcı adı, şifre gibi tüm gerekli bilgileri içerir. Müşteri linke tıkladığında, FRAME Player otomatik olarak yapılandırılır ve hizmet kullanıma hazır hale gelir."
    },
    {
      icon: Shield,
      question: "Hangi bilgileri içerir?",
      answer: "Magic Link şu bilgileri içerebilir: M3U playlist URL'si veya Xtream Codes bilgileri (sunucu, kullanıcı adı, şifre), hizmet adı, özel mesaj, destek URL'si ve logo URL'si. Tüm bu bilgiler isteğe bağlıdır ve şifrelenebilir."
    },
    {
      icon: CheckCircle,
      question: "Güvenli mi?",
      answer: "Evet! Magic Link oluştururken 'Linki Şifrele' seçeneğini aktif ederseniz, tüm bilgiler Base64 ile şifrelenir ve URL'de gizlenir. Böylece hassas bilgileriniz korunmuş olur."
    },
    {
      icon: Sparkles,
      question: "Nasıl oluşturulur?",
      answer: "Magic Link oluşturmak çok basit: 1) /magic-link sayfasına gidin 2) M3U veya Xtream Codes bilgilerini girin 3) İsteğe bağlı olarak hizmet adı, mesaj, destek URL'si ve logo ekleyin 4) 'Link Oluştur' butonuna tıklayın 5) Oluşan linki kopyalayıp müşterinize gönderin."
    },
    {
      icon: HelpCircle,
      question: "Müşterim ne yapmalı?",
      answer: "Müşterinizin yapması gereken tek şey gönderdiğiniz Magic Link'e tıklamak. Tıkladıktan sonra FRAME Player otomatik olarak açılacak ve hizmet yüklenecektir. Herhangi bir manuel kurulum gerekmez."
    },
    {
      icon: Shield,
      question: "Link şifrelemesi nedir?",
      answer: "Link şifrelemesi, hassas bilgilerinizi (sunucu adresi, kullanıcı adı, şifre) URL'de görünmez hale getirir. Şifreli linkler daha kısa ve daha güvenlidir. Şifreleme aktif olduğunda, tüm bilgiler Base64 formatında kodlanır."
    },
    {
      icon: Image,
      question: "Logo ve destek URL'si ekleyebilir miyim?",
      answer: "Evet! Magic Link oluştururken isteğe bağlı olarak logo URL'si (önerilen: 200x85px, PNG/SVG) ve destek URL'si ekleyebilirsiniz. Logo, müşterinizin sidebar'ında görünür. Destek URL'si ise ayarlarda bir buton olarak eklenir."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--iptv-background)] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-[var(--iptv-primary)]/10 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[var(--iptv-surface)]/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Ana Sayfa
            </Button>
          </Link>
          
          <Link href="/magic-link">
            <Button className="bg-gradient-to-r from-cyan-500 to-[var(--iptv-primary)] hover:opacity-90 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Magic Link Oluştur
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">Sık Sorulan Sorular</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Magic Link
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[var(--iptv-primary)]"> Rehberi</span>
          </h1>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Magic Link özelliği hakkında merak ettiğiniz her şey
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-6">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            return (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">{faq.question}</h3>
                    <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
       <div className="mt-16 bg-gradient-to-r from-cyan-500/10 to-[var(--iptv-primary)]/10 border border-cyan-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Hemen Başlayın</h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Müşterilerinize modern ve profesyonel bir deneyim sunmaya hazır mısınız?
          </p>
          <Link href="/magic-link">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-[var(--iptv-primary)] hover:opacity-90 text-white shadow-lg shadow-cyan-500/25 px-8 h-14 text-lg font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Magic Link Oluştur
            </Button>
          </Link>
        </div>
      </main>

      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />
    </div>
  );
}
