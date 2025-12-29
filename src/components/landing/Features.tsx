import { Tv, Film, Subtitles, Smartphone, Zap, Settings } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Dual Player Engine',
    description: 'Powered by Vidstack & Artplayer for maximum compatibility and smooth playback.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Tv,
    title: 'Xtream Codes & M3U Support',
    description: 'Connect with your Xtream Codes credentials or load any M3U/M3U8 playlist.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Subtitles,
    title: 'Advanced Subtitle Control',
    description: 'Full subtitle and multi-audio track support for movies and series.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Smartphone,
    title: 'Mobile & Smart TV Ready',
    description: 'Responsive design works perfectly on phones, tablets, and large screens.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Film,
    title: 'VOD Library',
    description: 'Browse and watch thousands of movies and TV series with poster artwork.',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: Settings,
    title: 'EPG Guide',
    description: 'Electronic Program Guide shows what\'s on now and upcoming programs.',
    color: 'from-indigo-500 to-violet-500',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 bg-[var(--iptv-surface-dark)]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Everything you need for the ultimate streaming experience, right in your browser.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
