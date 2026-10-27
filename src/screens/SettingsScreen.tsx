/**
 * Tela de configurações: endereço do broker, conexão/desconexão e tema.
 */
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConnectionStatus } from '../components/ConnectionStatus';
import { ThemedButton } from '../components/ThemedButton';
import { SUBSCRIBE_TOPICS, TOPICS } from '../config/topics';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../context/ThemeContext';

export function SettingsScreen(): React.JSX.Element {
  const { colors, isDark, toggleTheme } = useTheme();
  const {
    status,
    lastError,
    brokerUrl,
    setBrokerUrl,
    connect,
    disconnect,
  } = useMqtt();

  // Campo controlado local, sincronizado com a URL salva.
  const [urlInput, setUrlInput] = useState<string>(brokerUrl);

  useEffect(() => {
    setUrlInput(brokerUrl);
  }, [brokerUrl]);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  const handleConnect = (): void => {
    const trimmed = urlInput.trim();
    setBrokerUrl(trimmed);
    // setBrokerUrl atualiza a ref de forma assíncrona; passamos direto.
    connect();
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.heading, { color: colors.text }]}>Configurações</Text>

          <ConnectionStatus status={status} error={lastError} />

          {/* Broker */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textMuted }]}>
              URL WebSocket do broker
            </Text>
            <TextInput
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="wss://host:porta/mqtt"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              editable={!isConnecting}
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
            />
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Use uma porta WebSocket (WS/WSS), não a porta TCP 1883.
            </Text>

            <View style={styles.buttonRow}>
              <ThemedButton
                label={isConnecting ? 'Conectando...' : 'Conectar'}
                variant="success"
                onPress={handleConnect}
                loading={isConnecting}
                disabled={isConnected}
                style={styles.rowButton}
              />
              <ThemedButton
                label="Desconectar"
                variant="danger"
                onPress={disconnect}
                disabled={status === 'disconnected'}
                style={styles.rowButton}
              />
            </View>
          </View>

          {/* Tema */}
          <View
            style={[
              styles.section,
              styles.themeRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.themeLabel}>
              <Text style={[styles.themeTitle, { color: colors.text }]}>Tema escuro</Text>
              <Text style={[styles.hint, { color: colors.textMuted }]}>
                {isDark ? 'Dark ativo' : 'Light ativo'} — salvo automaticamente
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Tópicos (documentação dentro do app) */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.themeTitle, { color: colors.text }]}>Tópicos MQTT</Text>
            <TopicLine label="Subscribe" topic={TOPICS.temperature} colors={colors} />
            <TopicLine label="Subscribe" topic={TOPICS.humidity} colors={colors} />
            <TopicLine label="Subscribe" topic={TOPICS.lampState} colors={colors} />
            <TopicLine label="Publish" topic={TOPICS.lampCommand} colors={colors} />
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              {SUBSCRIBE_TOPICS.length} tópicos assinados automaticamente ao conectar.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TopicLine({
  label,
  topic,
  colors,
}: {
  label: string;
  topic: string;
  colors: { primary: string; text: string; surfaceAlt: string };
}): React.JSX.Element {
  return (
    <View style={styles.topicLine}>
      <View style={[styles.topicBadge, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={[styles.topicBadgeText, { color: colors.primary }]}>{label}</Text>
      </View>
      <Text style={[styles.topicText, { color: colors.text }]} numberOfLines={1}>
        {topic}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 16,
    gap: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
  },
  section: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  rowButton: {
    flex: 1,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeLabel: {
    flex: 1,
    gap: 2,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  topicLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 76,
    alignItems: 'center',
  },
  topicBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  topicText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
