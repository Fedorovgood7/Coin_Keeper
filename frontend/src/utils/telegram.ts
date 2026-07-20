// Telegram Web App API
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          setText: (text: string) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
          notificationOccurred: (type: 'success' | 'warning' | 'error') => void;
        };
      };
    };
  }
}

export const tg = window.Telegram?.WebApp;

export function isTelegram(): boolean {
  return !!tg;
}

export function initTelegram() {
  if (!tg) return null;
  
  tg.ready();
  tg.expand();
  
  const user = tg.initDataUnsafe?.user;
  if (user) {
    return {
      id: user.id.toString(),
      name: `${user.first_name} ${user.last_name || ''}`.trim(),
      avatar: user.photo_url,
      username: user.username,
    };
  }
  return null;
}

export function getTelegramTheme() {
  if (!tg?.themeParams) {
    return {
      bg: '#ffffff',
      text: '#000000',
      muted: '#8c8c8c',
      button: '#15191e',
    };
  }
  
  return {
    bg: tg.themeParams.bg_color || '#ffffff',
    text: tg.themeParams.text_color || '#000000',
    muted: tg.themeParams.hint_color || '#8c8c8c',
    button: tg.themeParams.button_color || '#15191e',
  };
}

export function setMainButton(text: string, onClick: () => void) {
  if (!tg?.MainButton) return;
  tg.MainButton.setText(text);
  tg.MainButton.onClick(onClick);
  tg.MainButton.show();
}

export function hideMainButton() {
  if (!tg?.MainButton) return;
  tg.MainButton.hide();
}

export function hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') {
  if (!tg?.HapticFeedback) return;
  
  if (type === 'success' || type === 'error' || type === 'warning') {
    tg.HapticFeedback.notificationOccurred(type);
  } else {
    tg.HapticFeedback.impactOccurred(type);
  }
}

export function getTelegramInitData(): string | null {
  return tg?.initData || null;
}
