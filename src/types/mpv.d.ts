export {};

declare global {
  interface Window {
    mpv: {
      isAvailable: () => boolean;
      getError?: () => string | null;
      load: (url: string) => Promise<void>;
      play: () => Promise<void>;
      pause: () => Promise<void>;
      seek: (seconds: number) => Promise<void>;
      stop: () => Promise<void>;
      getProperty: (name: string) => string | undefined;
      setProperty: (name: string, value: string) => void;
      command: (cmdArgs: string[]) => void;
      startRendering: (canvasId: string, onFirstFrame?: () => void) => () => void;
    };
  }
}
export {};
