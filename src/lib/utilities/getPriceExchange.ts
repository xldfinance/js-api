import { checkTokenExpired } from '../auth/checkTokenExpired';
import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';

export interface PriceExchange {
  pair: string;
  rate: number;
}

interface APIResponse {
  message: string;
  data: PriceExchange | null;
  copyright: string;
}

export interface GetPriceExchangeOptions {
  abortSignal?: RequestInit['signal'];
  query: {
    from: string;
    to: string;
  };
}

export async function getPriceExchange(
  options: GetPriceExchangeOptions
): Promise<PriceExchange> {
  const { abortSignal, query = { from: '', to: '' } } = options || {};

  try {
    const { headers } = new HeadersBuilder();
    const response = await fetch(
      `${baseAPI}/utilities/prices/${query.from}/${query.to}`,
      {
        signal: abortSignal,
        headers,
      }
    );

    const data = (await response.json()) as APIResponse;

    if (!response.ok || !data.data) {
      throw new XLDError(
        data.message || 'Failed to retrieve price exchange.',
        response.status
      );
    }

    return data.data;
  } catch (error) {
    checkTokenExpired(error);
    throw error;
  }
}
