/**
 * Cartão que exibe a leitura de um sensor, a unidade e o horário da atualização.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import type { SensorReading } from '../types/mqtt';
import { formatTime } from '../utils/format';

interface SensorCardProps {
  title: string;
  icon: string;
  unit: string;
  reading: SensorReading | null;
  accentColor?: string;
}

export function SensorCard({
  title,
  icon,
  unit,
  reading,
  accentColor,
}: SensorCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const accent = accentColor ?? colors.info;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: accent }]}>
          {reading ? reading.value.toString() : '--'}
        </Text>
        <Text style={[styles.unit, { color: colors.textMuted }]}>{unit}</Text>
      </View>

      <Text style={[styles.updated, { color: colors.textMuted }]}>
        {reading
          ? `Atualizado às ${formatTime(reading.updatedAt)}`
          : 'Aguardando leitura...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    minHeight: 130,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  value: {
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 44,
  },
  unit: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  updated: {
    fontSize: 12,
  },
});
