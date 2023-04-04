import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';

interface GasEstimate {
  network: string;
  blockchain_status: boolean;
  price_token: string;
  price_usd: string;
}

interface APIResponse {
  message: string;
  data: GasEstimate[] | null;
  copyright: string;
}

export interface GetGasEstimateOptions {
  abortSignal?: RequestInit['signal'];
  chain?: string;
}

export async function getGasEstimate(
  options = {} as GetGasEstimateOptions
): Promise<GasEstimate[]> {
  const { chain = 'evm' } = options;
  const { headers } = new HeadersBuilder();
  const { abortSignal } = options;
  const response = await fetch(`${baseAPI}/utilities/gas/${chain}`, {
    signal: abortSignal,
    headers,
  });

  const data = (await response.json()) as APIResponse;

  if (!response.ok || !data.data) {
    return Promise.reject(
      new XLDError(
        data.message || 'Failed to retrieve gas estimate.',
        response.status
      )
    );
  }

  return data.data;
}
