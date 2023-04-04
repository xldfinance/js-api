import { checkTokenExpired } from '../auth/checkTokenExpired';
import { getConfigManager } from '../config';
import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';
import type {
  BuyTokenQuote,
  PayBillsQuote,
  TopupQuote,
  TransferQuote,
} from '../transactions';
import type { TransactionStatusState } from './getTransactionStatus';

export type Currency =
  | 'USD'
  | 'PHP'
  | 'THB'
  | 'MYR'
  | 'VND'
  | 'BDT'
  | 'IDR'
  | 'INR';

type PaymentSource = 'CRYPTO' | 'FIAT';

export interface TransactionFiat {
  name: string;
  amount: number;
  currency: Currency;
  code: string;
  account: string;
  additional_fields: {
    address_line_1: string;
    address_line_2: string;
    country: string;
    province: string;
    city: string;
    zip_code: string;
  };
}

export interface TransactionCrypto {
  chain_id: number;
  token_symbol: string;
  amount: number;
}

export interface TransactionFees {
  platform_fee: {
    percentage: number;
    amount: number;
    amount_currency: Currency;
    waived: boolean;
  };
  gas_fee: {
    amount: number;
    amount_currency: Currency;
    waived: boolean;
  };
}

export interface TransactionTotal {
  amount: number;
  amount_currency: Currency;
}

export interface TransactionDetails {
  fiat:
    | TransferQuote['transaction_details']['fiat']
    | TopupQuote['transaction_details']['fiat']
    | PayBillsQuote['transaction_details']['fiat']
    | BuyTokenQuote['transaction_details']['fiat'];
  crypto: TransactionCrypto;
  fees: TransactionFees;
  total: TransactionTotal;
}

export interface Transaction {
  payment_source: PaymentSource;
  destination_wallet_address: string;
  source_wallet_address: string;
  xld_reference: string;
  transaction_type: 'BILLS' | 'LOAD' | 'BUY' | 'CASH';
  transaction_hash?: string;
  on_chain_status: TransactionStatusState;
  off_chain_status: TransactionStatusState;
  transaction_details: TransactionDetails;
}

export interface WalletHistory {
  items: Transaction[];
  current_page: number;
  total_count: number;
}

interface APIResponse {
  message: string;
  data: WalletHistory | null;
  copyright: string;
}

export interface GetWalletHistoryOptions {
  abortSignal?: RequestInit['signal'];
  query: {
    walletAddress: string;
    page?: number;
    size?: number;
    type?: Transaction['transaction_type'];
    status?: TransactionStatusState;
  };
}

export async function getWalletHistory(
  options: GetWalletHistoryOptions
): Promise<WalletHistory> {
  const { abortSignal, query = { walletAddress: '' } } = options || {};

  const params = {
    page: `${query.page || ''}`,
    size: `${query.size || ''}`,
    type: query.type || '',
    status: query.status || '',
  };

  const parsedParams = `page=${params.page}&size=${params.size}&type=${params.type}&status=${params.status}`;

  try {
    const token = getConfigManager().getAuthToken();
    const { headers } = new HeadersBuilder().withAuth(token);
    const response = await fetch(
      `${baseAPI}/transactions/wallet/${query.walletAddress}?${parsedParams}`,
      {
        signal: abortSignal,
        headers,
      }
    );

    const data = (await response.json()) as APIResponse;

    if (!response.ok || !data.data) {
      throw new XLDError(
        data.message || 'Failed to retrieve wallet history.',
        response.status
      );
    }

    return data.data;
  } catch (error) {
    checkTokenExpired(error);
    throw error;
  }
}
