/**
 * Tela de histórico: lista as 10 mensagens mais recentes (enviadas/recebidas).
 */
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MessageItem } from '../components/MessageItem';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../context/ThemeContext';
import type { MqttMessage } from '../types/mqtt';

export function HistoryScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const { history } = useMqtt();

  const renderItem = ({ item }: { item: MqttMessage }): React.JSX.Element => (
    <MessageItem message={item} />
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>Histórico</Text>
        <Text style={[styles.subheading, { color: colors.textMuted }]}>
          Últimas {history.length} de 10 mensagens
        </Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            Nenhuma mensagem ainda. Conecte-se e aguarde o simulador publicar dados.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
  },
  subheading: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    gap: 0,
    flexGrow: 1,
  },
  separator: {
    height: 10,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    paddingHorizontal: 24,
  },
});
