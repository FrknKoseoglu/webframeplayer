'use client';

import { useState } from 'react';

const COLORS = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
  '#3498db', '#9b59b6', '#e91e63', '#00bcd4', '#ff5722',
  '#795548', '#607d8b', '#8bc34a', '#ff9800', '#673ab7',
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface ChannelIconProps {
  name: string;
  logo?: string | null;
  className?: string;
  imgClassName?: string;
}

/**
 * Displays channel logo. Falls back to a colored initial letter if:
 * - logo URL is missing/null
 * - image fails to load (onError)
 */
export function ChannelIcon({ name, logo, className = 'w-10 h-10', imgClassName = 'w-8 h-8 object-contain' }: ChannelIconProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const letter = (name || '?').charAt(0).toUpperCase();
  const bg = getColorForName(name || '?');

  if (logo && !imgFailed) {
    return (
      <div className={`rounded bg-white/10 flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
        <img
          src={logo}
          alt=""
          className={imgClassName}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded flex items-center justify-center shrink-0 font-bold text-white select-none ${className}`}
      style={{ backgroundColor: bg }}
    >
      {letter}
    </div>
  );
}
