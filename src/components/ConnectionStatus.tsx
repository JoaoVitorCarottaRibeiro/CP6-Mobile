/**
 * Indicador visual do estado da conexão MQTT.
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { statusColor } from '../themes/colors';
import type { ConnectionStatus as Status } from '../types/mqtt';

interface ConnectionStatusProps {
  status: Status;
  error?: string | null;
}

const LABELS: Record<Status, string> = {
  connecting: 'Conectando...',
  connected: 'Conectado',
  disconnected: 'Desconectado',
  error: 'Erro de conexão',
};

export function ConnectionStatus({
  status,
  error,
}: ConnectionStatusProps): React.JSX.Element {
  const { colors } = useTheme();
  const color = statusColor(colors, status);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.row}>
        {status === 'connecting' ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <View style={[styles.dot, { backgroundColor: color }]} />
        )}
        <Text style={[styles.label, { color: colors.text }]}>{LABELS[status]}</Text>
      </View>
      {status === 'error' && error ? (
        <Text style={[styles.error, { color: colors.danger }]} numberOfLines={2}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    fontSize: 13,
    marginTop: 2,
  },
});
