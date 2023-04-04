import { checkTokenExpired } from '../auth/checkTokenExpired';
import { getConfigManager } from '../config';
import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';

export interface TopupConfirmation {
  xld_reference: number;
  source_wallet_address: string;
  transaction_hash?: string;
  transaction_type: 'LOAD';
}

interface APIResponse {
  message: string;
  data: TopupConfirmation | null;
  copyright: string;
}

export interface ConfirmTopupPaymentOptions {
  abortSignal?: RequestInit['signal'];
  payload: {
    xld_reference: number;
    transaction_hash: string;
  };
}

export async function confirmTopupPayment(
  options: ConfirmTopupPaymentOptions
): Promise<TopupConfirmation> {
  const { abortSignal, payload = {} } = options || {};

  try {
    const token = getConfigManager().getAuthToken();
    const { headers } = new HeadersBuilder().withAuth(token);
    const response = await fetch(`${baseAPI}/transactions/confirm/topup`, {
      method: 'POST',
      signal: abortSignal,
      headers,
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as APIResponse;

    if (!response.ok || !data.data) {
      throw new XLDError(
        data.message || 'Failed to confirm payment.',
        response.status
      );
    }

    return data.data;
  } catch (error) {
    checkTokenExpired(error);
    throw error;
  }
}
