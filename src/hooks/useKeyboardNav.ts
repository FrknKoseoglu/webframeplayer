import { useEffect, useCallback, useRef, MutableRefObject } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface UseKeyboardNavOptions {
  onSelect?: () => void;
  onBack?: () => void;
  enabled?: boolean;
}

interface FocusableElement {
  element: HTMLElement;
  row: number;
  col: number;
}

export function useKeyboardNav(
  containerRef: MutableRefObject<HTMLElement | null>,
  options: UseKeyboardNavOptions = {}
) {
  const { onSelect, onBack, enabled = true } = options;
  const currentIndex = useRef(0);

  // Get all focusable elements in the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>('[tabindex="0"], button, a, input')
    ).filter((el) => !el.hidden && el.offsetParent !== null);
  }, [containerRef]);

  // Move focus in a direction
  const moveFocus = useCallback(
    (direction: Direction) => {
      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const activeElement = document.activeElement as HTMLElement;
      const activeIndex = elements.indexOf(activeElement);

      let nextIndex = activeIndex;

      switch (direction) {
        case 'up':
          nextIndex = Math.max(0, activeIndex - 1);
          break;
        case 'down':
          nextIndex = Math.min(elements.length - 1, activeIndex + 1);
          break;
        case 'left':
          nextIndex = Math.max(0, activeIndex - 1);
          break;
        case 'right':
          nextIndex = Math.min(elements.length - 1, activeIndex + 1);
          break;
      }

      if (nextIndex !== activeIndex && elements[nextIndex]) {
        elements[nextIndex].focus();
        currentIndex.current = nextIndex;
      }
    },
    [getFocusableElements]
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          moveFocus('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          moveFocus('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          moveFocus('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          moveFocus('right');
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect?.();
          break;
        case 'Escape':
          event.preventDefault();
          onBack?.();
          break;
      }
    },
    [enabled, moveFocus, onSelect, onBack]
  );

  // Set up event listener
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  // Focus first element on mount
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
      currentIndex.current = 0;
    }
  }, [getFocusableElements]);

  return {
    focusFirst,
    moveFocus,
    currentIndex: currentIndex.current,
  };
}

// Simple hook for global keyboard shortcuts
export function useGlobalKeyboard(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const handler = shortcuts[key];
      
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
