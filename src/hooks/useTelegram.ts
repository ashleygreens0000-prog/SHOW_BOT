import { useMemo } from 'react';

const ADMIN_ID = import.meta.env.VITE_ADMIN_ID;

export function useTelegram() {
  const tg = useMemo(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      return window.Telegram.WebApp;
    }
    return null;
  }, []);

  const user = tg?.initDataUnsafe?.user ?? null;
  const isAdmin = user ? String(user.id) === String(ADMIN_ID) : false;

  const haptic = {
    light: () => tg?.HapticFeedback?.impactOccurred('light'),
    medium: () => tg?.HapticFeedback?.impactOccurred('medium'),
    heavy: () => tg?.HapticFeedback?.impactOccurred('heavy'),
    success: () => tg?.HapticFeedback?.notificationOccurred('success'),
    error: () => tg?.HapticFeedback?.notificationOccurred('error'),
  };

  const close = () => tg?.close();
  const expand = () => tg?.expand();
  const ready = () => tg?.ready();

  return { tg, user, isAdmin, haptic, close, expand, ready };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        close: () => void;
        expand: () => void;
        ready: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      };
    };
  }
}
