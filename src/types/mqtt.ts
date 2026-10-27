/**
 * Tipos compartilhados da camada MQTT e do domínio da aplicação IoT Control.
 */

/** Estados possíveis da conexão com o broker. */
export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

/** Direção de uma mensagem do ponto de vista do aplicativo. */
export type MessageDirection = 'sent' | 'received';

/** Estado da lâmpada virtual. 'unknown' enquanto nenhum estado foi recebido. */
export type LampState = 'ON' | 'OFF' | 'unknown';

/** Comando de lâmpada que o aplicativo pode publicar. */
export type LampCommand = 'ON' | 'OFF';

/** Tema visual suportado pela aplicação. */
export type ThemeName = 'light' | 'dark';

/** Uma mensagem registrada no histórico (enviada ou recebida). */
export interface MqttMessage {
  id: string;
  topic: string;
  payload: string;
  direction: MessageDirection;
  timestamp: number;
}

/** Leitura de um sensor com o instante em que foi atualizada. */
export interface SensorReading {
  value: number;
  updatedAt: number;
}

/** Payload esperado dos tópicos de sensores. */
export interface SensorPayload {
  value: number;
}

/** Payload esperado do tópico de estado da lâmpada. */
export interface LampStatePayload {
  state: LampCommand;
}

/** Payload publicado no tópico de comando da lâmpada. */
export interface LampCommandPayload {
  action: LampCommand;
}

/** Preferências locais persistidas via AsyncStorage. */
export interface AppPreferences {
  brokerUrl: string;
  theme: ThemeName;
}
