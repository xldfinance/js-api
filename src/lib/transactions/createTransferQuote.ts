import { checkTokenExpired } from '../auth/checkTokenExpired';
import { getConfigManager } from '../config';
import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';
import type { Currency } from '../wallet';

interface TransferTransactionDetails {
  fiat: {
    amount: number;
    code: string;
    currency: Currency;
    account: string;
    name: string;
    iso: string;
    account_type: string;
    additional_fields: {
      city: string;
      address_line_1: string;
      address_line_2: string;
      province: string;
      zip_code: string;
      country: string;
    };
  };
  crypto: {
    chain_id: string;
    token_symbol: string;
    amount: number;
    name: string;
  };
  fees: {
    platform_fee: {
      percentage: number;
      amount: number;
      amount_currency: string;
      waived: boolean;
    };
    gas_fee: {
      amount: number;
      amount_currency: string;
      waived: boolean;
    };
  };
  total: {
    amount: number;
    amount_currency: string;
  };
}

export interface TransferQuote {
  source_wallet_address: string;
  destination_wallet_address: string;
  xld_reference: number;
  payment_source: 'CRYPTO' | 'FIAT';
  transaction_type: 'CASH';
  transaction_details: TransferTransactionDetails;
}

interface APIResponse {
  message: string;
  data: TransferQuote | null;
  copyright: string;
}

export interface CreateTransferQuoteOptions {
  abortSignal?: RequestInit['signal'];
  payload: {
    source_wallet_address: string;
    transaction_type: 'CASH';
    fiat: {
      iso: string;
      code: string;
      currency: Currency;
      account: string;
      name: string;
      account_type?: string;
      callback?: string;
      [key: string]: unknown;
      additional_fields: {
        city: string;
        address_line_1: string;
        address_line_2: string;
        province: string;
        zip_code: string;
        country: string;
      };
    };
    crypto: {
      amount: number;
      chain_id: string;
      token_symbol: string;
    };
  };
}

export async function createTransferQuote(
  options: CreateTransferQuoteOptions
): Promise<TransferQuote> {
  const { abortSignal, payload = {} } = options || {};

  try {
    const token = getConfigManager().getAuthToken();
    const { headers } = new HeadersBuilder().withAuth(token);
    const response = await fetch(`${baseAPI}/transactions/quote/transfer`, {
      method: 'POST',
      signal: abortSignal,
      headers,
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as APIResponse;

    if (!response.ok || !data.data) {
      throw new XLDError(
        data.message || 'Failed to create transaction quotation.',
        response.status
      );
    }

    return data.data;
  } catch (error) {
    checkTokenExpired(error);
    throw error;
  }
}
