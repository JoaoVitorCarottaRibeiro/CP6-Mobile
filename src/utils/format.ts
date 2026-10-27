/**
 * Funções utilitárias de formatação.
 */

/** Formata um timestamp (ms) como HH:MM:SS no fuso local. */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
