'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeTextProps {
  children: string;
  className?: string;
  /** Speed in px/second (default: 30) */
  speed?: number;
}

/**
 * Text that shows ellipsis when truncated, and smoothly scrolls
 * left→right (ping-pong) on hover so the user can read the full text.
 * Only animates when the text actually overflows its container.
 */
export function MarqueeText({ children, className, speed = 30 }: MarqueeTextProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [overflowPx, setOverflowPx] = useState(0);

  // Measure how many pixels the text overflows
  const measure = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    // Reset any transform to get accurate measurement
    inner.style.transform = '';
    const diff = inner.scrollWidth - outer.clientWidth;
    setOverflowPx(diff > 2 ? diff : 0);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, [children, measure]);

  const shouldAnimate = hovered && overflowPx > 0;
  // Duration = distance / speed, minimum 1.5s, plus pause time on each end
  const durationSec = Math.max(overflowPx / speed, 1.5);

  return (
    <div
      ref={outerRef}
      className={cn('overflow-hidden whitespace-nowrap text-ellipsis', className)}
      onMouseEnter={() => { measure(); setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
      // Inline ellipsis when not hovered
      style={!shouldAnimate ? { textOverflow: 'ellipsis' } : { textOverflow: 'clip' }}
    >
      <span
        ref={innerRef}
        className="inline-block whitespace-nowrap"
        style={shouldAnimate ? {
          animation: `marquee-scroll ${durationSec}s ease-in-out 0.3s infinite alternate`,
          ['--marquee-offset' as string]: `-${overflowPx}px`,
        } : {}}
      >
        {children}
      </span>
    </div>
  );
}
