/**
 * Contexto que conecta a camada de serviço MQTT com a interface React.
 *
 * Responsável por:
 *  - manter o estado de conexão, leituras de sensores, estado da lâmpada e
 *    histórico das 10 mensagens mais recentes;
 *  - validar os payloads recebidos antes de atualizar a UI;
 *  - registrar e, principalmente, REMOVER os listeners do serviço na limpeza
 *    do efeito, evitando acúmulo de eventos duplicados.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { DEFAULT_BROKER_URL, SUBSCRIBE_TOPICS, TOPICS } from '../config/topics';
import {
  type IncomingMessage,
  mqttService,
} from '../services/mqttService';
import { loadPreferences, saveBrokerUrl } from '../services/storageService';
import type {
  ConnectionStatus,
  LampCommand,
  LampState,
  MqttMessage,
  SensorReading,
} from '../types/mqtt';

const HISTORY_LIMIT = 10;

interface MqttContextValue {
  status: ConnectionStatus;
  lastError: string | null;
  isLoadingPrefs: boolean;
  brokerUrl: string;
  temperature: SensorReading | null;
  humidity: SensorReading | null;
  lampState: LampState;
  history: MqttMessage[];
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  setBrokerUrl: (url: string) => void;
  sendLampCommand: (command: LampCommand) => boolean;
}

const MqttContext = createContext<MqttContextValue | undefined>(undefined);

let messageCounter = 0;
const nextId = (): string => `${Date.now()}-${(messageCounter += 1)}`;

/** Tenta extrair um número do payload de um sensor. */
function parseSensorValue(payload: string): number | null {
  try {
    const data: unknown = JSON.parse(payload);
    if (
      data !== null &&
      typeof data === 'object' &&
      'value' in data &&
      typeof (data as { value: unknown }).value === 'number' &&
      Number.isFinite((data as { value: number }).value)
    ) {
      return (data as { value: number }).value;
    }
  } catch {
    // payload não era JSON válido
  }
  return null;
}

/** Valida e extrai o estado da lâmpada do payload recebido. */
function parseLampState(payload: string): LampCommand | null {
  try {
    const data: unknown = JSON.parse(payload);
    if (data !== null && typeof data === 'object' && 'state' in data) {
      const state = (data as { state: unknown }).state;
      if (state === 'ON' || state === 'OFF') {
        return state;
      }
    }
  } catch {
    // payload inválido
  }
  return null;
}

export function MqttProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState<boolean>(true);
  const [brokerUrl, setBrokerUrlState] = useState<string>(DEFAULT_BROKER_URL);
  const [temperature, setTemperature] = useState<SensorReading | null>(null);
  const [humidity, setHumidity] = useState<SensorReading | null>(null);
  const [lampState, setLampState] = useState<LampState>('unknown');
  const [history, setHistory] = useState<MqttMessage[]>([]);

  // Guarda a URL atual para os callbacks sem recriar listeners.
  const brokerUrlRef = useRef<string>(brokerUrl);
  brokerUrlRef.current = brokerUrl;

  const addToHistory = useCallback((message: MqttMessage) => {
    setHistory((prev) => [message, ...prev].slice(0, HISTORY_LIMIT));
  }, []);

  // Carrega preferências e conecta automaticamente uma única vez.
  useEffect(() => {
    let mounted = true;
    void loadPreferences().then((prefs) => {
      if (!mounted) {
        return;
      }
      setBrokerUrlState(prefs.brokerUrl);
      setIsLoadingPrefs(false);
      mqttService.connect(prefs.brokerUrl, SUBSCRIBE_TOPICS);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Registra listeners do serviço MQTT uma única vez e os remove na limpeza.
  useEffect(() => {
    const removeStatus = mqttService.onStatusChange((next, error) => {
      setStatus(next);
      setLastError(error ?? (next === 'error' ? 'Erro de conexão' : null));
    });

    const removeMessage = mqttService.onMessage((msg: IncomingMessage) => {
      // 1) Registra no histórico toda mensagem recebida.
      addToHistory({
        id: nextId(),
        topic: msg.topic,
        payload: msg.payload,
        direction: 'received',
        timestamp: Date.now(),
      });

      // 2) Atualiza o estado específico, validando o payload.
      if (msg.topic === TOPICS.temperature) {
        const value = parseSensorValue(msg.payload);
        if (value !== null) {
          setTemperature({ value, updatedAt: Date.now() });
        }
      } else if (msg.topic === TOPICS.humidity) {
        const value = parseSensorValue(msg.payload);
        if (value !== null) {
          setHumidity({ value, updatedAt: Date.now() });
        }
      } else if (msg.topic === TOPICS.lampState) {
        const state = parseLampState(msg.payload);
        if (state !== null) {
          setLampState(state);
        }
      }
    });

    // Limpeza: remove os listeners para não duplicar eventos.
    return () => {
      removeStatus();
      removeMessage();
    };
  }, [addToHistory]);

  const connect = useCallback(() => {
    setLastError(null);
    mqttService.connect(brokerUrlRef.current, SUBSCRIBE_TOPICS);
  }, []);

  const disconnect = useCallback(() => {
    mqttService.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    setLastError(null);
    mqttService.connect(brokerUrlRef.current, SUBSCRIBE_TOPICS);
  }, []);

  const setBrokerUrl = useCallback((url: string) => {
    setBrokerUrlState(url);
    void saveBrokerUrl(url);
  }, []);

  const sendLampCommand = useCallback(
    (command: LampCommand): boolean => {
      const payload = JSON.stringify({ action: command });
      const ok = mqttService.publish(TOPICS.lampCommand, payload);
      if (ok) {
        addToHistory({
          id: nextId(),
          topic: TOPICS.lampCommand,
          payload,
          direction: 'sent',
          timestamp: Date.now(),
        });
      }
      return ok;
    },
    [addToHistory],
  );

  const value = useMemo<MqttContextValue>(
    () => ({
      status,
      lastError,
      isLoadingPrefs,
      brokerUrl,
      temperature,
      humidity,
      lampState,
      history,
      connect,
      disconnect,
      reconnect,
      setBrokerUrl,
      sendLampCommand,
    }),
    [
      status,
      lastError,
      isLoadingPrefs,
      brokerUrl,
      temperature,
      humidity,
      lampState,
      history,
      connect,
      disconnect,
      reconnect,
      setBrokerUrl,
      sendLampCommand,
    ],
  );

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
}

export function useMqtt(): MqttContextValue {
  const ctx = useContext(MqttContext);
  if (!ctx) {
    throw new Error('useMqtt deve ser usado dentro de MqttProvider');
  }
  return ctx;
}
