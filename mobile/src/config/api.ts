import {Platform} from 'react-native';

const API_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

/**
 * URL base da API.
 *
 * - Android Emulator: http://10.0.2.2:8080
 * - iOS Simulator:    http://localhost:8080
 * - Dispositivo físico: altere para http://SEU_IP_LOCAL:8080
 *   Exemplo: http://192.168.1.100:8080
 */
export const API_BASE_URL = `http://${API_HOST}:8080`;
