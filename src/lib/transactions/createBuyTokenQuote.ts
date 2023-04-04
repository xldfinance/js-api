import { checkTokenExpired } from '../auth/checkTokenExpired';
import { getConfigManager } from '../config';
import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';
import type { Currency } from '../wallet';

interface BuyTokenQuoteTransactionDetails {
  fiat: {
    type: string;
    amount: number;
    currency: Currency;
    iso: string;
    additional_fields?: {
      description: string;
      statement_descriptor: string;
      [key: string]: unknown;
    };
    card?: {
      name: string;
      number: string;
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
      amount_currency: Currency;
      waived: boolean;
    };
    gas_fee: {
      amount: number;
      amount_currency: Currency;
      waived: boolean;
    };
  };
  total: {
    amount: number;
    amount_currency: Currency;
  };
}

export interface BuyTokenQuote {
  source_wallet_address?: string;
  destination_wallet_address: string;
  xld_reference: number;
  callback: string;
  redirect: string;
  payment_source: 'CRYPTO' | 'FIAT';
  transaction_type: 'BUY';
  transaction_details: BuyTokenQuoteTransactionDetails;
}

interface APIResponse {
  message: string;
  data: BuyTokenQuote | null;
  copyright: string;
}

export interface CreateBuyTokenQuoteOptions {
  abortSignal?: RequestInit['signal'];
  payload: {
    source_wallet_address: string;
    transaction_type: 'BUY';
    callback: string;
    fiat: {
      type: string;
      amount: number;
      currency: Currency;
      iso: string;
      card?: {
        name: string;
        number: string;
        exp_month: string;
        exp_year: string;
        cvc: string;
      };
      additional_fields?: {
        description: string;
        statement_descriptor: string;
        [key: string]: unknown;
      };
    };
    crypto: {
      chain_id: string;
      token_symbol: string;
    };
  };
}

export async function createBuyTokenQuote(
  options: CreateBuyTokenQuoteOptions
): Promise<BuyTokenQuote> {
  const { abortSignal, payload = {} } = options || {};

  try {
    const token = getConfigManager().getAuthToken();
    const { headers } = new HeadersBuilder().withAuth(token);
    const response = await fetch(`${baseAPI}/transactions/quote/buy`, {
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
