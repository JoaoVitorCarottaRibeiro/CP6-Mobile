/**
 * Navegação por abas inferiores entre as três telas principais.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

type TabParamList = {
  Dashboard: undefined;
  Historico: undefined;
  Configuracoes: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, string> = {
  Dashboard: '📊',
  Historico: '🕑',
  Configuracoes: '⚙️',
};

export function AppNavigator(): React.JSX.Element {
  const { colors, isDark } = useTheme();

  const navTheme: Theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarIcon: ({ color }) => (
            <Text style={[styles.icon, { color }]}>{ICONS[route.name]}</Text>
          ),
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ tabBarLabel: 'Dashboard' }}
        />
        <Tab.Screen
          name="Historico"
          component={HistoryScreen}
          options={{ tabBarLabel: 'Histórico' }}
        />
        <Tab.Screen
          name="Configuracoes"
          component={SettingsScreen}
          options={{ tabBarLabel: 'Config' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
  },
});
