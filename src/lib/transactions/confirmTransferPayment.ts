import { checkTokenExpired } from '../auth/checkTokenExpired';
import { getConfigManager } from '../config';
import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';

export interface TransferConfirmation {
  xld_reference: number;
  source_wallet_address: string;
  transaction_hash?: string;
  transaction_type: 'CASH';
}

interface APIResponse {
  message: string;
  data: TransferConfirmation | null;
  copyright: string;
}

export interface ConfirmTransferPaymentOptions {
  abortSignal?: RequestInit['signal'];
  payload: {
    xld_reference: number;
    transaction_hash: string;
  };
}

export async function confirmTransferPayment(
  options: ConfirmTransferPaymentOptions
): Promise<TransferConfirmation> {
  const { abortSignal, payload = {} } = options || {};

  try {
    const token = getConfigManager().getAuthToken();
    const { headers } = new HeadersBuilder().withAuth(token);
    const response = await fetch(`${baseAPI}/transactions/confirm/transfer`, {
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
