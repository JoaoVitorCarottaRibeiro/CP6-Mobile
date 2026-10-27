/**
 * Camada de comunicação MQTT, totalmente separada da interface.
 *
 * Expõe uma pequena API baseada em "listeners" (status e mensagens). Os
 * listeners são guardados em Set, garantindo que o mesmo callback nunca seja
 * registrado duas vezes — isso evita o acúmulo de eventos duplicados quando as
 * telas montam/desmontam. Cada `subscribe` devolve uma função de limpeza.
 */
import mqtt, { type IClientOptions, type MqttClient } from 'mqtt';

import type { ConnectionStatus } from '../types/mqtt';

/** Mensagem crua recebida do broker. */
export interface IncomingMessage {
  topic: string;
  payload: string;
}

type StatusListener = (status: ConnectionStatus, error?: string) => void;
type MessageListener = (message: IncomingMessage) => void;

class MqttService {
  private client: MqttClient | null = null;
  private url = '';
  private topics: readonly string[] = [];
  private status: ConnectionStatus = 'disconnected';

  private readonly statusListeners = new Set<StatusListener>();
  private readonly messageListeners = new Set<MessageListener>();

  /** Registra um listener de status e retorna a função para removê-lo. */
  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    // Entrega o estado atual imediatamente para sincronizar a UI.
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /** Registra um listener de mensagens e retorna a função para removê-lo. */
  onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getUrl(): string {
    return this.url;
  }

  private setStatus(status: ConnectionStatus, error?: string): void {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status, error));
  }

  /**
   * Conecta ao broker via WebSocket e assina os tópicos informados.
   * Encerra qualquer conexão anterior antes de abrir uma nova.
   */
  connect(url: string, topics: readonly string[]): void {
    this.disconnect();

    this.url = url.trim();
    this.topics = topics;
    this.setStatus('connecting');

    const options: IClientOptions = {
      // clientId único para não colidir com outros clientes no broker público.
      clientId: `iot-control-${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      reconnectPeriod: 4000,
      connectTimeout: 8000,
      keepalive: 30,
      resubscribe: true,
    };

    try {
      this.client = mqtt.connect(this.url, options);
    } catch (err) {
      this.setStatus('error', err instanceof Error ? err.message : String(err));
      return;
    }

    this.attachHandlers(this.client);
  }

  private attachHandlers(client: MqttClient): void {
    client.on('connect', () => {
      this.setStatus('connected');
      if (this.topics.length > 0) {
        client.subscribe(this.topics as string[], { qos: 0 }, (err) => {
          if (err) {
            this.setStatus('error', `Falha ao assinar tópicos: ${err.message}`);
          }
        });
      }
    });

    client.on('reconnect', () => {
      this.setStatus('connecting');
    });

    client.on('message', (topic: string, payload: Uint8Array) => {
      this.messageListeners.forEach((listener) =>
        listener({ topic, payload: payload.toString() }),
      );
    });

    client.on('error', (err: Error) => {
      this.setStatus('error', err.message);
    });

    client.on('offline', () => {
      // Só reflete como desconectado se o usuário não encerrou de propósito.
      if (this.client) {
        this.setStatus('connecting');
      }
    });

    client.on('close', () => {
      if (this.client) {
        // Conexão caiu; o mqtt.js tentará reconectar automaticamente.
        if (this.status !== 'error') {
          this.setStatus('connecting');
        }
      }
    });
  }

  /**
   * Publica um comando. Retorna false (sem publicar) quando não há conexão —
   * a UI usa esse retorno para avisar o usuário, evitando publicação silenciosa.
   */
  publish(topic: string, payload: string): boolean {
    if (!this.client || this.status !== 'connected' || !this.client.connected) {
      return false;
    }
    this.client.publish(topic, payload, { qos: 0, retain: false });
    return true;
  }

  /** Força uma nova tentativa de conexão usando a última URL/tópicos. */
  reconnect(): void {
    if (this.url) {
      this.connect(this.url, this.topics);
    }
  }

  /** Encerra a conexão e remove todos os handlers do cliente atual. */
  disconnect(): void {
    if (this.client) {
      const client = this.client;
      this.client = null;
      client.removeAllListeners();
      try {
        client.end(true);
      } catch {
        // ignora erros ao encerrar
      }
    }
    this.setStatus('disconnected');
  }
}

/** Instância única compartilhada por toda a aplicação. */
export const mqttService = new MqttService();
