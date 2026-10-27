/**
 * Paletas de cores para os temas Light e Dark.
 */
import type { ThemeName } from '../types/mqtt';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  accentOn: string;
  accentOff: string;
}

const light: ThemeColors = {
  background: '#F2F4F8',
  surface: '#FFFFFF',
  surfaceAlt: '#ECEFF4',
  border: '#D5DBE5',
  text: '#121826',
  textMuted: '#5B6678',
  primary: '#2563EB',
  primaryText: '#FFFFFF',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  info: '#0891B2',
  accentOn: '#F59E0B',
  accentOff: '#64748B',
};

const dark: ThemeColors = {
  background: '#0B1221',
  surface: '#141C2E',
  surfaceAlt: '#1C2538',
  border: '#2A3550',
  text: '#E8ECF4',
  textMuted: '#93A0B8',
  primary: '#3B82F6',
  primaryText: '#FFFFFF',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#22D3EE',
  accentOn: '#FBBF24',
  accentOff: '#64748B',
};

export const themes: Record<ThemeName, ThemeColors> = { light, dark };

/** Cor associada a cada estado de conexão. */
export const statusColor = (
  colors: ThemeColors,
  status: 'connecting' | 'connected' | 'disconnected' | 'error',
): string => {
  switch (status) {
    case 'connected':
      return colors.success;
    case 'connecting':
      return colors.warning;
    case 'error':
      return colors.danger;
    case 'disconnected':
    default:
      return colors.textMuted;
  }
};
