import type {AuthResponse, RegisterPayload, SignInPayload} from '../types';
import {api} from './client';

function signIn(payload: SignInPayload) {
  return api.post<AuthResponse>('/auth/sign-in', payload).then(r => r.data);
}

function register(payload: RegisterPayload) {
  return api.post<AuthResponse>('/auth/register', payload).then(r => r.data);
}

export {register, signIn};
