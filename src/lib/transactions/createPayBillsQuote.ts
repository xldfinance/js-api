import { checkTokenExpired } from '../auth/checkTokenExpired';
import { getConfigManager } from '../config';
import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';
import type { Currency } from '../wallet';

interface PayBillsQuoteTransactionDetails {
  fiat: {
    amount: number;
    currency: Currency;
    code: string;
    iso: string;
    account: string;
    name: string;
    additional_fields?: {
      address_line_1: string;
      address_line_2: string;
      country: string;
      province: string;
      city: string;
      zip_code: string;
    };
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

export interface PayBillsQuote {
  source_wallet_address: string;
  destination_wallet_address: string;
  xld_reference: number;
  fiat_reference_number: string;
  payment_source: 'CRYPTO' | 'FIAT';
  transaction_type: 'BILLS';
  transaction_details: PayBillsQuoteTransactionDetails;
}

interface APIResponse {
  message: string;
  data: PayBillsQuote | null;
  copyright: string;
}

export interface CreatePayBillsQuoteOptions {
  abortSignal?: RequestInit['signal'];
  payload: {
    source_wallet_address: string;
    transaction_type: 'BILLS';
    fiat: {
      amount: number;
      currency: Currency;
      code: string;
      iso: string;
      [key: string]: unknown;
    };
    crypto: {
      chain_id: string;
      token_symbol: string;
    };
  };
}

export async function createPayBillsQuote(
  options: CreatePayBillsQuoteOptions
): Promise<PayBillsQuote> {
  const { abortSignal, payload = {} } = options || {};

  try {
    const token = getConfigManager().getAuthToken();
    const { headers } = new HeadersBuilder().withAuth(token);
    const response = await fetch(`${baseAPI}/transactions/quote/pay`, {
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
