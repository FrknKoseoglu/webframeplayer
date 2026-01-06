'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

type ConfirmType = 'warning' | 'danger' | 'info' | 'success';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
}

interface ConfirmProviderProps {
  children: ReactNode;
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef?.(false);
  };

  const getIcon = (type: ConfirmType = 'warning') => {
    switch (type) {
      case 'danger':
        return <XCircle className="w-10 h-10 text-red-400" />;
      case 'success':
        return <CheckCircle className="w-10 h-10 text-emerald-400" />;
      case 'info':
        return <Info className="w-10 h-10 text-blue-400" />;
      default:
        return <AlertTriangle className="w-10 h-10 text-amber-400" />;
    }
  };

  const getButtonColor = (type: ConfirmType = 'warning') => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-amber-600 hover:bg-amber-700';
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="bg-[var(--iptv-surface)] border-white/10 text-white max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center gap-4 py-4">
              {getIcon(options?.type)}
              <DialogTitle className="text-xl">{options?.title}</DialogTitle>
              <DialogDescription className="text-zinc-400 whitespace-pre-line">
                {options?.description}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              {options?.cancelText || 'İptal'}
            </Button>
            <Button
              onClick={handleConfirm}
              className={`flex-1 text-white ${getButtonColor(options?.type)}`}
            >
              {options?.confirmText || 'Onayla'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
