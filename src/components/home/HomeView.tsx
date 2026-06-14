'use client';

import { useRouter } from 'next/navigation';
import { Tv, Film, Video, Settings, ChevronDown, LogOut } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { toast } from 'sonner';

interface HomeViewProps {
  onNavigate: (nav: string) => void;
  backgroundImage?: string;
}

export function HomeView({ onNavigate, backgroundImage }: HomeViewProps) {
  const router = useRouter();
  const { activeProfile, content } = usePlayerStore();

  // Get a random movie poster for background
  const moviePosters = content
    .filter((item) => item.type === 'movie' && item.logo)
    .slice(0, 20);
  
  const randomPoster = backgroundImage || moviePosters[Math.floor(Math.random() * moviePosters.length)]?.logo;

  const categories = [
    { 
      id: 'live', 
      label: 'Canlı TV', 
      icon: Tv, 
      description: 'Canlı yayınları izle',
      color: 'from-red-600 to-orange-600',
      count: content.filter(c => c.type === 'live').length
    },
    { 
      id: 'movies', 
      label: 'Filmler', 
      icon: Film, 
      description: 'Binlerce film',
      color: 'from-purple-600 to-pink-600',
      count: content.filter(c => c.type === 'movie').length
    },
    { 
      id: 'series', 
      label: 'Diziler', 
      icon: Video, 
      description: 'Dizi arşivi',
      color: 'from-blue-600 to-cyan-600',
      count: content.filter(c => c.type === 'series').length
    },
    { 
      id: 'settings', 
      label: 'Ayarlar', 
      icon: Settings, 
      description: 'Uygulama ayarları',
      color: 'from-gray-600 to-zinc-600',
      count: null
    },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Image with Gradient */}
      {randomPoster && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${randomPoster})`,
              filter: 'blur(2px)',
            }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center p-6 md:p-12 overflow-auto">
        {/* Welcome Text */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">
            Hoş Geldiniz, <span className="text-[var(--frame-primary)]">{activeProfile?.name}</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60">
            İzlemek istediğiniz kategoriyi seçin
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isEmpty = cat.count === 0;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (isEmpty && (cat.id === 'movies' || cat.id === 'series')) {
                    toast.error(`Bu hizmette ${cat.label.toLowerCase()} mevcut değildir.`);
                    return;
                  }
                  onNavigate(cat.id);
                }}
                className={`group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 text-left min-h-[120px] md:min-h-[160px] ${isEmpty ? 'opacity-60' : ''}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>

                {/* Label */}
                <h3 className="text-base md:text-xl font-bold text-white mb-1">{cat.label}</h3>
                <p className="text-xs md:text-sm text-white/50 hidden sm:block">{cat.description}</p>

                {/* Count Badge */}
                {cat.count !== null && (
                  <div className={`absolute top-3 right-3 md:top-4 md:right-4 px-2 py-1 rounded-lg ${isEmpty ? 'bg-red-500/20' : 'bg-white/10'}`}>
                    <span className={`text-xs font-medium ${isEmpty ? 'text-red-300' : 'text-white/70'}`}>{cat.count.toLocaleString()}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 md:mt-12 flex flex-wrap gap-4 md:gap-8 text-white/40">
          <div>
            <span className="text-2xl md:text-3xl font-bold text-white">{content.filter(c => c.type === 'live').length}</span>
            <span className="ml-2 text-xs md:text-sm">Canlı Kanal</span>
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-bold text-white">{content.filter(c => c.type === 'movie').length}</span>
            <span className="ml-2 text-xs md:text-sm">Film</span>
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-bold text-white">{content.filter(c => c.type === 'series').length}</span>
            <span className="ml-2 text-xs md:text-sm">Dizi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
