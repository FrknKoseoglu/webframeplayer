import { Link2, KeyRound, Play } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Link2,
    title: 'Get Your Playlist',
    description: 'Obtain your IPTV playlist URL or Xtream Codes credentials from your provider.',
  },
  {
    number: '02',
    icon: KeyRound,
    title: 'Enter Credentials',
    description: 'Enter your Xtream Codes login details or paste your M3U playlist URL.',
  },
  {
    number: '03',
    icon: Play,
    title: 'Start Streaming',
    description: 'Enjoy instant access to Live TV, Movies, and Series. No installation needed!',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-32 bg-[var(--iptv-background)]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Get started in just 3 simple steps. No downloads, no plugins.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center">
                {/* Connector Line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-[var(--iptv-primary)]/50 to-transparent" />
                )}

                {/* Step Number */}
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--iptv-primary)] to-red-700 mb-6">
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
