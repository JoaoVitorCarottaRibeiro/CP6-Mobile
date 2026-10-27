# IoT Control — Painel de Monitoramento e Controle IoT via MQTT

Aplicativo mobile em **React Native + Expo + TypeScript** que se comunica com
dispositivos IoT simulados usando o protocolo **MQTT** sobre **WebSocket**.
O app **recebe telemetria** (temperatura e umidade) em tempo real e **publica
comandos** para controlar uma **lâmpada virtual**, demonstrando o modelo
publish/subscribe, atualização em tempo real, persistência de preferências e a
integração com um dispositivo IoT simulado.

---

## 👥 Integrantes do grupo

João Vitor Carotta Ribeiro - RM 555187
Arthur Bueno de Oliveira - RM 558396
Victor Magdaleno Marcos - RM 556729

## 🎯 Objetivo

Demonstrar o funcionamento do modelo **publish/subscribe** do MQTT, o uso de
tópicos e o gerenciamento de conexão e mensagens em uma aplicação mobile, sem
necessidade de hardware físico (um simulador faz o papel do dispositivo).

## 🧰 Tecnologias e versões

| Tecnologia | Versão | Uso |
|---|---|---|
| Expo | ~52.0.0 | Runtime / tooling React Native |
| React Native | 0.76.5 | Framework mobile |
| React | 18.3.1 | Biblioteca de UI |
| TypeScript | ~5.3.3 | Tipagem estática |
| mqtt (mqtt.js) | ^5.10.1 | Cliente MQTT (app e simulador) |
| @react-navigation/native + bottom-tabs | ^7 | Navegação por abas |
| @react-native-async-storage/async-storage | 1.23.1 | Persistência de preferências |
| buffer | ^6.0.3 | Polyfill necessário ao mqtt.js no RN |
| Node.js | 18+ | Execução do simulador |

## 📁 Estrutura do projeto

```text
.
├── App.tsx                 # Provedores (tema, MQTT) + navegação
├── index.ts                # Entry point + carregamento dos polyfills
├── app.json                # Configuração do Expo
├── simulator/
│   ├── simulator.js        # Simulador do dispositivo IoT (Node.js)
│   └── package.json
└── src/
    ├── components/
    │   ├── ConnectionStatus.tsx
    │   ├── SensorCard.tsx
    │   ├── MessageItem.tsx
    │   └── ThemedButton.tsx
    ├── config/
    │   └── topics.ts        # GROUP_ID, URL padrão e tópicos
    ├── context/
    │   ├── MqttContext.tsx  # Estado da conexão, sensores, histórico
    │   └── ThemeContext.tsx # Tema Light/Dark persistido
    ├── navigation/
    │   └── AppNavigator.tsx
    ├── screens/
    │   ├── DashboardScreen.tsx
    │   ├── HistoryScreen.tsx
    │   └── SettingsScreen.tsx
    ├── services/
    │   ├── mqttService.ts   # Comunicação MQTT isolada da UI
    │   └── storageService.ts
    ├── themes/
    │   └── colors.ts
    ├── types/
    │   └── mqtt.ts
    ├── utils/
    │   └── format.ts
    └── polyfills.ts
```

## 🚀 Instalação e execução do aplicativo

Pré-requisitos: **Node.js 18+**, **npm** e o app **Expo Go** no celular (ou um
emulador Android / simulador iOS).

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o Expo
npm start
```

- Pressione **a** para abrir no Android, **i** no iOS ou **w** no navegador.
- Ou escaneie o QR Code com o app **Expo Go** (Android/iOS).

> O app tenta conectar automaticamente ao broker salvo ao iniciar. A conexão
> também pode ser gerenciada manualmente na aba **Configurações**.

## 🌐 Broker MQTT (WebSocket)

Por padrão o aplicativo usa o broker público **EMQX** via **WSS**:

```
wss://broker.emqx.io:8084/mqtt
```

- **Porta WebSocket segura (WSS):** `8084` — usada pelo **aplicativo**.
- **Porta MQTT TCP:** `1883` — usada pelo **simulador** (Node.js).

> ⚠️ Não confundir a porta TCP (1883) com a porta WebSocket (8084/8083). O app
> precisa de uma URL **WS/WSS**. Nenhuma credencial é necessária no broker
> público; **nenhuma senha ou token é incluída no repositório**.

Alternativas de broker público por WebSocket (podem ser configuradas na tela
de Configurações):

| Broker | URL WebSocket |
|---|---|
| EMQX (WSS) | `wss://broker.emqx.io:8084/mqtt` |
| EMQX (WS) | `ws://broker.emqx.io:8083/mqtt` |
| HiveMQ (WSS) | `wss://broker.hivemq.com:8884/mqtt` |
| HiveMQ (WS) | `ws://broker.hivemq.com:8000/mqtt` |

## 📡 Tópicos, payloads e direção

Identificador exclusivo do grupo: **`fiap/turma/grupo01`**
(definido em [`src/config/topics.ts`](src/config/topics.ts) — altere o
`GROUP_ID` para evitar interferência com outros projetos).

| Tópico | Direção no app | Payload de exemplo |
|---|---|---|
| `fiap/turma/grupo01/sensor/temperatura` | Subscribe | `{"value":24.5}` |
| `fiap/turma/grupo01/sensor/umidade` | Subscribe | `{"value":58}` |
| `fiap/turma/grupo01/lampada/comando` | Publish | `{"action":"ON"}` |
| `fiap/turma/grupo01/lampada/estado` | Subscribe | `{"state":"ON"}` |

O estado exibido da lâmpada **reflete a mensagem recebida** em
`.../lampada/estado`, e não apenas o toque no botão: o app publica o comando, o
simulador recebe e publica o novo estado, e só então a interface muda.

## 🤖 Simulador (reproduzível, sem hardware)

O repositório inclui um simulador em Node.js que faz o papel do dispositivo:
publica temperatura/umidade a cada 5 s e responde aos comandos da lâmpada.

```bash
# Em outro terminal, a partir da raiz do projeto:
cd simulator
npm install
npm start
```

Ou, a partir da raiz, após instalar as dependências do simulador:

```bash
npm run simulator
```

Variáveis de ambiente opcionais:

```bash
# Trocar o broker (ex.: HiveMQ) ou o grupo, ou o intervalo (ms)
BROKER_URL=mqtt://broker.hivemq.com:1883 GROUP_ID=fiap/turma/grupo01 INTERVAL_MS=3000 node simulator.js
```

> O simulador conecta via TCP (1883) e o app via WSS (8084) **no mesmo broker**,
> então as mensagens fluem entre eles.

### Alternativa sem o script (qualquer cliente MQTT)

Com uma ferramenta como **MQTTX**, **mosquitto_pub/sub** ou o **MQTT Playground**
do EMQX, conecte ao mesmo broker e:

```bash
# Publicar leituras
mosquitto_pub -h broker.emqx.io -t "fiap/turma/grupo01/sensor/temperatura" -m '{"value":24.5}'
mosquitto_pub -h broker.emqx.io -t "fiap/turma/grupo01/sensor/umidade" -m '{"value":58}'

# Assinar o comando e responder com o estado
mosquitto_sub -h broker.emqx.io -t "fiap/turma/grupo01/lampada/comando"
mosquitto_pub -h broker.emqx.io -t "fiap/turma/grupo01/lampada/estado" -m '{"state":"ON"}'
```

## ✅ Ciclo completo de verificação

1. O simulador publica uma **temperatura** → a tela atualiza.
2. O simulador publica uma **umidade** → a tela atualiza.
3. O usuário toca em **Ligar** no app → comando publicado em `.../lampada/comando`.
4. O simulador recebe o comando e publica `{"state":"ON"}` em `.../lampada/estado`.
5. O app recebe e exibe o estado **Ligada**.
6. O mesmo fluxo funciona para **Desligar**.

## 🖼️ Telas e funcionalidades

> Adicione os prints reais em uma pasta `docs/` e referencie-os abaixo, por
> exemplo `![Dashboard](docs/dashboard.png)`.

### 1. Dashboard
- Status da conexão (**conectando / conectado / desconectado / erro**) com
  mensagem de erro quando houver, e botão **Reconectar**.
- Cartões de **temperatura** e **umidade** com o último valor e o **horário**
  da atualização.
- Estado da **lâmpada virtual** (Ligada / Desligada / Desconhecido), refletindo
  a mensagem de estado recebida.
- Botões **Ligar** e **Desligar**, desabilitados quando desconectado, com
  feedback ao usuário (sem publicação silenciosa).

### 2. Histórico
- Lista as **10 mensagens mais recentes** (enviadas e recebidas), com **tópico,
  payload, direção e horário**, atualizada em tempo real.

### 3. Configurações
- Campo para a **URL WebSocket do broker**, botões **Conectar/Desconectar**.
- Alternância de **tema Light/Dark** (persistida).
- Documentação dos tópicos dentro do próprio app.

## 💾 Preferências locais (AsyncStorage)

- A **URL do broker** e o **tema** são salvos com AsyncStorage e **recuperados
  ao reiniciar** o aplicativo.

## 🧱 Decisões técnicas

- **Comunicação isolada da UI:** toda a lógica MQTT fica em
  [`src/services/mqttService.ts`](src/services/mqttService.ts); a UI consome via
  o contexto [`MqttContext`](src/context/MqttContext.tsx).
- **Sem listeners duplicados:** os listeners são guardados em `Set` e cada
  registro devolve uma função de remoção, chamada na limpeza dos `useEffect`.
- **Validação de payloads:** mensagens são parseadas e validadas antes de
  atualizar o estado, evitando falhas com dados inválidos.
- **Reconexão:** `reconnectPeriod` automático do mqtt.js + ação manual de
  **Reconectar** na interface.
- **TypeScript estrito:** `strict` e `noImplicitAny` ligados; estados,
  mensagens e componentes tipados, sem `any`.
- **Polyfills:** `Buffer`/`process` em [`src/polyfills.ts`](src/polyfills.ts),
  carregados em [`index.ts`](index.ts) antes do cliente MQTT.

## ⚠️ Limitações e observações

- O broker público é compartilhado; use um `GROUP_ID` exclusivo para evitar
  interferência. Mensagens de terceiros no mesmo tópico podem aparecer.
- O suporte **Web** depende do broker aceitar WSS a partir do navegador (o
  EMQX público aceita). Em Android/iOS a conexão WSS funciona normalmente.
- Nenhuma credencial é armazenada no repositório; para brokers privados,
  configure usuário/senha fora do controle de versão (ex.: variáveis de
  ambiente / arquivo `.env`, já ignorado pelo `.gitignore`).

## 📋 Checklist de entrega

- [x] Conecta ao broker via WebSocket.
- [x] Mostra status da conexão e erros.
- [x] Recebe temperatura e umidade em tempo real.
- [x] Publica comandos ON/OFF.
- [x] Recebe confirmação de estado da lâmpada.
- [x] Exibe histórico das 10 últimas mensagens.
- [x] Salva URL do broker e tema com AsyncStorage.
- [x] Possui Light/Dark.
- [x] Usa TypeScript, hooks e componentes organizados.
- [x] Não acumula listeners duplicados.
- [x] Inclui simulador reproduzível.
- [ ] **README com nome e RM dos integrantes (preencher!).**
- [ ] Repositório GitHub acessível.
