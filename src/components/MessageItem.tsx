/**
 * Item do histórico de mensagens: tópico, payload, direção e horário.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import type { MqttMessage } from '../types/mqtt';
import { formatTime } from '../utils/format';

interface MessageItemProps {
  message: MqttMessage;
}

export function MessageItem({ message }: MessageItemProps): React.JSX.Element {
  const { colors } = useTheme();
  const isSent = message.direction === 'sent';
  const badgeColor = isSent ? colors.primary : colors.success;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{isSent ? 'ENVIADA' : 'RECEBIDA'}</Text>
        </View>
        <Text style={[styles.time, { color: colors.textMuted }]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>

      <Text style={[styles.topic, { color: colors.text }]} numberOfLines={1}>
        {message.topic}
      </Text>
      <Text style={[styles.payload, { color: colors.textMuted }]} numberOfLines={3}>
        {message.payload}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
  },
  topic: {
    fontSize: 14,
    fontWeight: '700',
  },
  payload: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
