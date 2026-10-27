/**
 * Persistência de preferências locais com AsyncStorage.
 *
 * Guarda a URL do broker e o tema escolhido, recuperando-os na inicialização.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_BROKER_URL } from '../config/topics';
import type { AppPreferences, ThemeName } from '../types/mqtt';

const KEY_BROKER_URL = '@iot_control/broker_url';
const KEY_THEME = '@iot_control/theme';

const isThemeName = (value: string | null): value is ThemeName =>
  value === 'light' || value === 'dark';

/** Carrega as preferências salvas, aplicando valores padrão quando ausentes. */
export async function loadPreferences(): Promise<AppPreferences> {
  try {
    const [[, brokerUrl], [, theme]] = await AsyncStorage.multiGet([
      KEY_BROKER_URL,
      KEY_THEME,
    ]);

    return {
      brokerUrl: brokerUrl ?? DEFAULT_BROKER_URL,
      theme: isThemeName(theme) ? theme : 'dark',
    };
  } catch {
    return { brokerUrl: DEFAULT_BROKER_URL, theme: 'dark' };
  }
}

/** Persiste a URL do broker. */
export async function saveBrokerUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_BROKER_URL, url);
  } catch {
    // falha de persistência não deve quebrar o fluxo do app
  }
}

/** Persiste o tema escolhido. */
export async function saveTheme(theme: ThemeName): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_THEME, theme);
  } catch {
    // falha de persistência não deve quebrar o fluxo do app
  }
}
