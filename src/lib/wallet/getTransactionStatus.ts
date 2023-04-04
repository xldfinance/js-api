import { checkTokenExpired } from '../auth/checkTokenExpired';
import { getConfigManager } from '../config';
import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';

export type TransactionStatusState =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED';

export interface TransactionStatus {
  wallet_address: string;
  transaction_hash: string;
  xld_reference: string;
  transaction_type: 'BILLS' | 'LOAD' | 'CASH' | 'BUY';
  status: {
    on_chain: TransactionStatusState;
    off_chain: TransactionStatusState;
  };
}

interface APIResponse {
  message: string;
  data: TransactionStatus | null;
  copyright: string;
}

export interface GetTransactionStatusOptions {
  abortSignal?: RequestInit['signal'];
  query: {
    walletAddress: string;
    reference: number;
  };
}

export async function getTransactionStatus(
  options: GetTransactionStatusOptions
): Promise<TransactionStatus> {
  const { abortSignal, query = { walletAddress: '', reference: -1 } } =
    options || {};

  try {
    const token = getConfigManager().getAuthToken();
    const { headers } = new HeadersBuilder().withAuth(token);
    const response = await fetch(
      `${baseAPI}/transactions/status/${query.walletAddress}/${query.reference}`,
      {
        signal: abortSignal,
        headers,
      }
    );

    const data = (await response.json()) as APIResponse;

    if (!response.ok || !data.data) {
      throw new XLDError(
        data.message || 'Failed to retrieve transaction status.',
        response.status
      );
    }

    return data.data;
  } catch (error) {
    checkTokenExpired(error);
    throw error;
  }
}
