/**
 * Tela principal: status da conexão, sensores, estado da lâmpada e controles.
 */
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConnectionStatus } from '../components/ConnectionStatus';
import { SensorCard } from '../components/SensorCard';
import { ThemedButton } from '../components/ThemedButton';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../context/ThemeContext';
import { formatTime } from '../utils/format';

export function DashboardScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const {
    status,
    lastError,
    isLoadingPrefs,
    temperature,
    humidity,
    lampState,
    history,
    reconnect,
    sendLampCommand,
  } = useMqtt();

  const isConnected = status === 'connected';
  const lampOn = lampState === 'ON';

  // Feedback quando o usuário tenta comandar sem conexão.
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const lastCommandAt = history.find((m) => m.direction === 'sent')?.timestamp ?? null;

  const handleCommand = useCallback(
    (action: 'ON' | 'OFF') => {
      const ok = sendLampCommand(action);
      if (!ok) {
        setFeedback('Sem conexão com o broker. Reconecte para enviar comandos.');
      } else {
        setFeedback(`Comando "${action}" publicado. Aguardando confirmação...`);
      }
    },
    [sendLampCommand],
  );

  if (isLoadingPrefs) {
    return (
      <SafeAreaView style={[styles.flex, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Carregando preferências...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: colors.text }]}>IoT Control</Text>
        <Text style={[styles.subheading, { color: colors.textMuted }]}>
          Painel de monitoramento e controle do ambiente inteligente
        </Text>

        <ConnectionStatus status={status} error={lastError} />

        {status !== 'connected' ? (
          <ThemedButton
            label={status === 'connecting' ? 'Conectando...' : 'Reconectar'}
            onPress={reconnect}
            variant="primary"
            loading={status === 'connecting'}
          />
        ) : null}

        <View style={styles.sensorRow}>
          <SensorCard
            title="Temperatura"
            icon="🌡️"
            unit="°C"
            reading={temperature}
            accentColor={colors.warning}
          />
          <SensorCard
            title="Umidade"
            icon="💧"
            unit="%"
            reading={humidity}
            accentColor={colors.info}
          />
        </View>

        {/* Estado da lâmpada: reflete a MENSAGEM de estado recebida. */}
        <View
          style={[
            styles.lampCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.lampIcon, { opacity: lampOn ? 1 : 0.35 }]}>💡</Text>
          <Text style={[styles.lampTitle, { color: colors.textMuted }]}>
            Lâmpada virtual
          </Text>
          <Text
            style={[
              styles.lampState,
              {
                color:
                  lampState === 'unknown'
                    ? colors.textMuted
                    : lampOn
                      ? colors.accentOn
                      : colors.accentOff,
              },
            ]}
          >
            {lampState === 'unknown' ? 'Desconhecido' : lampOn ? 'Ligada' : 'Desligada'}
          </Text>
          <Text style={[styles.lampHint, { color: colors.textMuted }]}>
            {lastCommandAt
              ? `Último comando enviado às ${formatTime(lastCommandAt)}`
              : 'Nenhum comando enviado ainda'}
          </Text>
        </View>

        <View style={styles.controlRow}>
          <ThemedButton
            label="Ligar"
            variant="success"
            onPress={() => handleCommand('ON')}
            disabled={!isConnected}
            style={styles.controlButton}
          />
          <ThemedButton
            label="Desligar"
            variant="danger"
            onPress={() => handleCommand('OFF')}
            disabled={!isConnected}
            style={styles.controlButton}
          />
        </View>

        {!isConnected ? (
          <Text style={[styles.warning, { color: colors.warning }]}>
            Conecte-se ao broker para controlar a lâmpada.
          </Text>
        ) : null}

        {feedback ? (
          <Text style={[styles.feedback, { color: colors.textMuted }]}>{feedback}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  content: {
    padding: 16,
    gap: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
  },
  subheading: {
    fontSize: 14,
    marginTop: -10,
  },
  sensorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  lampCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  lampIcon: {
    fontSize: 48,
  },
  lampTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  lampState: {
    fontSize: 26,
    fontWeight: '800',
  },
  lampHint: {
    fontSize: 12,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
  },
  warning: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  feedback: {
    fontSize: 13,
    textAlign: 'center',
  },
});
