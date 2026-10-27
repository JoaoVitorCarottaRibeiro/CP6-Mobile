/**
 * Polyfills necessários para a biblioteca mqtt.js funcionar no React Native.
 *
 * O bundle do mqtt.js para ambientes "browser" usa a API global WebSocket
 * (já existente no React Native) mas também depende de Buffer e de um objeto
 * process mínimo, que não existem por padrão no runtime do Hermes/RN.
 */
import { Buffer } from 'buffer';

// Alias com tipagem frouxa para não conflitar com a tipagem global do Node.
interface GlobalShim {
  Buffer?: unknown;
  process?: {
    env?: Record<string, string | undefined>;
    nextTick?: (cb: () => void) => void;
  };
}

const shim = globalThis as unknown as GlobalShim;

if (typeof shim.Buffer === 'undefined') {
  shim.Buffer = Buffer;
}

if (!shim.process) {
  shim.process = { env: {} };
}

if (!shim.process.env) {
  shim.process.env = {};
}

if (!shim.process.nextTick) {
  shim.process.nextTick = (cb: () => void): void => {
    setTimeout(cb, 0);
  };
}
