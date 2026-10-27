// Polyfills precisam ser carregados antes de qualquer uso do cliente MQTT.
import './src/polyfills';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent chama AppRegistry.registerComponent('main', () => App)
// e garante que o ambiente esteja configurado tanto no Expo Go quanto em um build nativo.
registerRootComponent(App);
