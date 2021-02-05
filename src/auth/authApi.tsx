import axios from 'axios';
import { baseUrl, config, withLogs } from '../core';

const authUrl = `http://${baseUrl}/auth`;

export interface AuthProps {
  role: string;
}

export const login: (name?: string) => Promise<AuthProps> = (name) => {
  return withLogs(axios.post(authUrl, {name}, config), 'login');
}
