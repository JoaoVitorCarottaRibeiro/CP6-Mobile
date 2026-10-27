/**
 * Componente raiz: injeta os provedores de tema e MQTT e a barra de status.
 */
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MqttProvider } from './src/context/MqttContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function ThemedStatusBar(): React.JSX.Element {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MqttProvider>
          <ThemedStatusBar />
          <AppNavigator />
        </MqttProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
