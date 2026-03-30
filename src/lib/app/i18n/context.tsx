'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { useSettingsStore, type AppLanguage } from '../stores/settings.store';
import type { Messages } from './types';
import az from './messages/az';
import en from './messages/en';
import ru from './messages/ru';
import tr from './messages/tr';

const MESSAGES: Record<AppLanguage, Messages> = { az, en, ru, tr };

const I18nContext = createContext<Messages>(az);

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useSettingsStore((s) => s.language);
  const [messages, setMessages] = useState<Messages>(MESSAGES[language]);

  useEffect(() => {
    setMessages(MESSAGES[language]);
  }, [language]);

  return <I18nContext.Provider value={messages}>{children}</I18nContext.Provider>;
}

export function useT(): Messages {
  return useContext(I18nContext);
}
