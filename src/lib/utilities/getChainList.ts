import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';

export interface Blockchain {
  chain_type: string;
  rpc: string;
  chain_id: number;
  id: string;
  name: string;
  network: string;
  created_at: number;
}

interface APIResponse {
  message: string;
  data: Blockchain[] | null;
  copyright: string;
}

export interface GetChainListOptions {
  abortSignal?: RequestInit['signal'];
}

export async function getChainList(
  options = {} as GetChainListOptions
): Promise<Blockchain[]> {
  const { headers } = new HeadersBuilder();

  const { abortSignal } = options;
  const response = await fetch(`${baseAPI}/utilities/chains`, {
    signal: abortSignal,
    headers,
  });

  const data = (await response.json()) as APIResponse;

  if (!response.ok || !data.data) {
    return Promise.reject(
      new XLDError(
        data.message || 'Failed to retrieve chain list.',
        response.status
      )
    );
  }

  return data.data;
}
