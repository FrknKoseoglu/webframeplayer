'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Is this player free to use?',
    answer: 'Yes! The Web IPTV Player is completely free to use. You just need your own IPTV subscription or playlist URL from your provider.',
  },
  {
    question: 'Does it support MKV and MP4 files?',
    answer: 'Yes, the player supports a wide range of formats including MKV, MP4, and HLS (M3U8) streams. Our dual player engine ensures maximum compatibility.',
  },
  {
    question: 'Can I use it on iPhone or Android?',
    answer: 'Absolutely! The Web IPTV Player is fully responsive and works on any device with a modern web browser - including iOS Safari and Android Chrome.',
  },
  {
    question: 'What is Xtream Codes?',
    answer: 'Xtream Codes is a popular IPTV panel system used by many providers. If your provider uses Xtream Codes, you can connect using your server URL, username, and password.',
  },
  {
    question: 'Do I need to install anything?',
    answer: 'No installation required! The player runs entirely in your web browser. Just enter your credentials and start watching.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Your credentials are stored locally in your browser and never sent to our servers. The player connects directly to your IPTV provider.',
  },
];

// FAQ Schema for SEO
export function FAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-32 bg-[var(--iptv-surface-dark)]">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-white/60">
            Got questions? We've got answers.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors min-h-[60px]"
              >
                <span className="text-white font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-white/60 shrink-0 transition-transform duration-200',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <p className="px-5 pb-5 text-white/60 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
