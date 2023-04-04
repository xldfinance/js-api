import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';
import type { Currency } from '../wallet';

export type PayInType = {
  'e-wallets': boolean;
  cards: boolean;
};

export type PayOutType = {
  'e-wallets': boolean;
  topup: boolean;
  bills_payment: boolean;
  banks: boolean;
};

export interface Country {
  name: string;
  iso: string;
  currency: Currency;
  active: boolean;
  country_code: string;
  icon: string;
  'pay-in': PayInType;
  'pay-out': PayOutType;
}

interface APIResponse {
  message: string;
  data: Country[] | null;
  copyright: string;
}

export interface GetCountryListOptions {
  abortSignal?: RequestInit['signal'];
}

export async function getCountryList(
  options = {} as GetCountryListOptions
): Promise<Country[]> {
  const { headers } = new HeadersBuilder();
  const { abortSignal } = options;
  const response = await fetch(`${baseAPI}/utilities/countries`, {
    signal: abortSignal,
    headers,
  });

  const data = (await response.json()) as APIResponse;

  if (!response.ok || !data.data) {
    return Promise.reject(
      new XLDError(
        data.message || 'Failed to retrieve countries.',
        response.status
      )
    );
  }

  return data.data;
}
