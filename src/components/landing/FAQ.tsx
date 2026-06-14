'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

// FAQ Schema for SEO
export function FAQSchema() {
  // Static English schema for SEO bots (they don't execute JS)
  const faqs = [
    { q: 'Is this player free and open source?', a: 'Yes! The Web Frame Player is completely free and open source.' },
    { q: 'Does it support MKV and MP4 files?', a: 'Yes, the player supports MKV, MP4, and HLS streams.' },
    { q: 'What is Xtream Codes?', a: 'Xtream Codes is a popular Yayın panel system.' },
    { q: 'Do I need to install anything?', a: 'No installation required! Runs in your browser.' },
    { q: 'Is my data secure?', a: 'Credentials are stored locally, never sent to our servers.' },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
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
  const { t } = useTranslation();
  const f = t.landing.faq;

  const faqs = [
    { question: f.q1, answer: f.a1 },
    { question: f.q2, answer: f.a2 },
    { question: f.q4, answer: f.a4 },
    { question: f.q5, answer: f.a5 },
    { question: f.q6, answer: f.a6 },
    { question: f.q7, answer: f.a7 },
    { question: f.q8, answer: f.a8 },
  ];

  return (
    <section className="py-20 md:py-32 bg-[var(--frame-surface-dark)]">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {f.title}
          </h2>
          <p className="text-lg text-white/60">
            {f.subtitle}
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
