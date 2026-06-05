import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import {API_BASE_URL} from '../config/api';

const KEYCHAIN_SERVICE = 'fitmeet-session';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async config => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (credentials && credentials.password) {
      config.headers.Authorization = `Bearer ${credentials.password}`;
    }
  } catch {
    // Sem token salvo — segue sem header
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.response) {
      const message =
        error.response.data?.error || 'Erro inesperado.';
      const apiError = new Error(message);
      (apiError as any).status = error.response.status;
      return Promise.reject(apiError);
    }

    return Promise.reject(
      new Error('Erro de conexão. Verifique sua rede e tente novamente.'),
    );
  },
);

async function saveToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('fitmeet', token, {
    service: KEYCHAIN_SERVICE,
  });
}

async function getToken(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
    return credentials ? credentials.password : null;
  } catch {
    return null;
  }
}

async function removeToken(): Promise<void> {
  await Keychain.resetGenericPassword({service: KEYCHAIN_SERVICE});
}

export {api, getToken, removeToken, saveToken};
