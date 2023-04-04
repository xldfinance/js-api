import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';

export interface TokenChain {
  id: string;
  name: string;
  chain_id: number;
  contract_address: string;
  chain_type: string;
  handled_decimals: number;
  decimals: number;
}

export interface Token {
  icon_src: string;
  created_at: number;
  name: string;
  symbol: string;
  chains: TokenChain[];
}

interface APIResponse {
  message: string;
  data: Token[] | null;
  copyright: string;
}

export interface GetTokenListOptions {
  abortSignal?: RequestInit['signal'];
}

export async function getTokenList(
  options = {} as GetTokenListOptions
): Promise<Token[]> {
  const { headers } = new HeadersBuilder();
  const { abortSignal } = options;
  const response = await fetch(`${baseAPI}/utilities/tokens`, {
    signal: abortSignal,
    headers,
  });

  const data = (await response.json()) as APIResponse;

  if (!response.ok || !data.data) {
    return Promise.reject(
      new XLDError(
        data.message || 'Failed to retrieve token list.',
        response.status
      )
    );
  }

  return data.data;
}
