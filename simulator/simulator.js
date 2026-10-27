/**
 * Simulador de dispositivo IoT para o projeto IoT Control.
 *
 * Faz o papel do "hardware": publica leituras de temperatura e umidade em
 * intervalos regulares e, ao receber um comando no tópico da lâmpada, publica
 * o novo estado — fechando o ciclo publish/subscribe exigido pela avaliação.
 *
 * Uso:
 *   node simulator/simulator.js
 *   BROKER_URL=mqtt://broker.hivemq.com:1883 node simulator/simulator.js
 *
 * Observação: o simulador (Node.js) pode usar a porta MQTT TCP (1883), enquanto
 * o aplicativo usa a porta WebSocket (WSS 8084). Ambos conversam pelo MESMO
 * broker, então as mensagens fluem entre eles normalmente.
 */
const mqtt = require('mqtt');

// Deve corresponder ao GROUP_ID usado no aplicativo (src/config/topics.ts).
const GROUP_ID = process.env.GROUP_ID || 'fiap/turma/grupo01';

const TOPICS = {
  temperature: `${GROUP_ID}/sensor/temperatura`,
  humidity: `${GROUP_ID}/sensor/umidade`,
  lampCommand: `${GROUP_ID}/lampada/comando`,
  lampState: `${GROUP_ID}/lampada/estado`,
};

// O app usa WSS; aqui (Node) usamos TCP no mesmo broker público EMQX.
const BROKER_URL = process.env.BROKER_URL || 'mqtt://broker.emqx.io:1883';

const PUBLISH_INTERVAL_MS = Number(process.env.INTERVAL_MS || 5000);

let lampState = 'OFF';

const client = mqtt.connect(BROKER_URL, {
  clientId: `iot-simulator-${Math.random().toString(16).slice(2, 10)}`,
  clean: true,
  reconnectPeriod: 4000,
});

const randomInRange = (min, max, decimals = 1) => {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
};

const log = (...args) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}]`, ...args);
};

client.on('connect', () => {
  log(`Conectado ao broker: ${BROKER_URL}`);
  log(`Grupo: ${GROUP_ID}`);

  client.subscribe(TOPICS.lampCommand, (err) => {
    if (err) {
      log('Erro ao assinar o tópico de comando:', err.message);
      return;
    }
    log(`Inscrito em ${TOPICS.lampCommand}`);
  });

  // Publica o estado inicial da lâmpada.
  publishLampState();

  // Publica leituras de sensores periodicamente.
  setInterval(() => {
    const temperature = randomInRange(18, 32, 1);
    const humidity = randomInRange(40, 80, 0);

    client.publish(TOPICS.temperature, JSON.stringify({ value: temperature }));
    client.publish(TOPICS.humidity, JSON.stringify({ value: humidity }));

    log(`Publicado -> temperatura=${temperature}°C | umidade=${humidity}%`);
  }, PUBLISH_INTERVAL_MS);
});

client.on('message', (topic, payload) => {
  if (topic !== TOPICS.lampCommand) {
    return;
  }

  let action;
  try {
    const data = JSON.parse(payload.toString());
    action = data.action;
  } catch (err) {
    log('Comando ignorado (JSON inválido):', payload.toString());
    return;
  }

  if (action !== 'ON' && action !== 'OFF') {
    log('Comando ignorado (ação inválida):', action);
    return;
  }

  lampState = action;
  log(`Comando recebido: ${action}`);
  publishLampState();
});

function publishLampState() {
  client.publish(
    TOPICS.lampState,
    JSON.stringify({ state: lampState }),
    { retain: true },
  );
  log(`Estado da lâmpada publicado: ${lampState}`);
}

client.on('error', (err) => {
  log('Erro MQTT:', err.message);
});

process.on('SIGINT', () => {
  log('Encerrando simulador...');
  client.end(true, () => process.exit(0));
});
