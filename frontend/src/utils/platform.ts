import { useEffect, useState } from 'react';
import { isTelegram, initTelegram, getTelegramTheme } from './telegram';

export type Platform = 'web' | 'pwa' | 'telegram';

export function getPlatform(): Platform {
  if (isTelegram()) return 'telegram';
  if (window.matchMedia('(display-mode: standalone)').matches) return 'pwa';
  return 'web';
}

export function usePlatform() {
  const [platform, setPlatform] = useState<Platform>('web');
  
  useEffect(() => {
    setPlatform(getPlatform());
  }, []);
  
  return platform;
}

export function useTelegram() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    avatar?: string;
    username?: string;
  } | null>(null);
  
  useEffect(() => {
    if (isTelegram()) {
      const tgUser = initTelegram();
      if (tgUser) {
        setUser(tgUser);
      }
    }
  }, []);
  
  return { user, isTelegram: isTelegram() };
}

export function useTheme() {
  const [theme, setTheme] = useState({
    bg: '#ffffff',
    text: '#000000',
    muted: '#8c8c8c',
    button: '#15191e',
  });
  
  useEffect(() => {
    if (isTelegram()) {
      setTheme(getTelegramTheme());
    }
  }, []);
  
  return theme;
}
