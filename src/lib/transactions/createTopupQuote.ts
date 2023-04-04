import { checkTokenExpired } from '../auth/checkTokenExpired';
import { getConfigManager } from '../config';
import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';
import type { Currency } from '../wallet';

interface TopupTransactionDetails {
  fiat: {
    product_id: number;
    mobile_number: string;
    currency: Currency;
    amount: number;
    iso: string;
  };
  crypto: {
    chain_id: string;
    token_symbol: string;
    name: string;
    amount: number;
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

export interface TopupQuote {
  source_wallet_address: string;
  destination_wallet_address: string;
  xld_reference: number;
  payment_source: 'CRYPTO' | 'FIAT';
  transaction_type: 'LOAD';
  transaction_details: TopupTransactionDetails;
}

interface APIResponse {
  message: string;
  data: TopupQuote | null;
  copyright: string;
}

export interface CreateTopupQuoteOptions {
  abortSignal?: RequestInit['signal'];
  payload: {
    source_wallet_address: string;
    transaction_type: 'LOAD';
    fiat: {
      product_id: number;
      iso: string;
      mobile_number: string;
      currency: Currency;
    };
    crypto: {
      chain_id: string;
      token_symbol: string;
    };
  };
}

export async function createTopupQuote(
  options: CreateTopupQuoteOptions
): Promise<TopupQuote> {
  const { abortSignal, payload = {} } = options || {};

  try {
    const token = getConfigManager().getAuthToken();
    const { headers } = new HeadersBuilder().withAuth(token);
    const response = await fetch(`${baseAPI}/transactions/quote/topup`, {
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
