import { getConfigManager } from '../config';
import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';

export interface AuthKeys {
  public: string;
  secret: string;
}

interface AuthResponse {
  token: string;
  message?: string;
}

export async function authenticate(payload: AuthKeys): Promise<string> {
  const { public: publicKey, secret } = (payload || {}) as Partial<AuthKeys>;

  try {
    if (!publicKey || !secret) {
      throw new XLDError('Authentication credentials are required.', 400);
    }

    const { headers } = new HeadersBuilder();
    const response = await fetch(`${baseAPI}/authenticate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ public: publicKey, secret }),
    });

    const data = (await response.json()) as AuthResponse;

    if (!response.ok || !data.token) {
      throw new XLDError(
        data.message || 'Failed to authenticate.',
        response.status
      );
    }

    getConfigManager().setAuthToken(data.token);

    return data.token;
  } catch (error) {
    getConfigManager().setAuthToken(null);
    throw error;
  }
}
