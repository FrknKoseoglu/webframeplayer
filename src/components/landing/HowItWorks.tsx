'use client';

import { Link2, KeyRound, Play } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function HowItWorks() {
  const { t } = useTranslation();
  const h = t.landing.howItWorks;

  const steps = [
    {
      number: '01',
      icon: Link2,
      title: h.step1Title,
      description: h.step1Desc,
    },
    {
      number: '02',
      icon: KeyRound,
      title: h.step2Title,
      description: h.step2Desc,
    },
    {
      number: '03',
      icon: Play,
      title: h.step3Title,
      description: h.step3Desc,
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-[var(--frame-background)]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {h.title}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {h.subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => {
            return (
              <div key={index} className="relative text-center">
                {/* Connector Line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-[var(--frame-primary)]/50 to-transparent" />
                )}

                {/* Step Number */}
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--frame-primary)] to-red-700 mb-6">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
