/**
 * Identificador exclusivo do grupo e definição central dos tópicos MQTT.
 *
 * Mantê-los em um único arquivo evita divergência entre o aplicativo e o
 * simulador e facilita trocar o prefixo do grupo caso necessário.
 */

/** Prefixo único do grupo para evitar interferência entre projetos. */
export const GROUP_ID = 'fiap/turma/grupo01';

/** URL WebSocket padrão do broker (broker público EMQX via WSS). */
export const DEFAULT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

/** Tópicos utilizados pela aplicação. */
export const TOPICS = {
  temperature: `${GROUP_ID}/sensor/temperatura`,
  humidity: `${GROUP_ID}/sensor/umidade`,
  lampCommand: `${GROUP_ID}/lampada/comando`,
  lampState: `${GROUP_ID}/lampada/estado`,
} as const;

/** Tópicos nos quais o aplicativo se inscreve (subscribe). */
export const SUBSCRIBE_TOPICS: readonly string[] = [
  TOPICS.temperature,
  TOPICS.humidity,
  TOPICS.lampState,
];
