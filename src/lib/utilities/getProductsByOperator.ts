import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';
import type { Product } from './getProductById';

interface APIResponse {
  message: string;
  data: Product[] | null;
  copyright: string;
}

export interface GetProductsByOperatorOptions {
  abortSignal?: RequestInit['signal'];
  query: {
    operator: string;
  };
  payload: {
    token_symbol: string;
    chain_id: string;
  };
}

export async function getProductsByOperator(
  options: GetProductsByOperatorOptions
): Promise<Product[]> {
  const { headers } = new HeadersBuilder();
  const { abortSignal, query = { operator: '' }, payload = {} } = options || {};
  const response = await fetch(
    `${baseAPI}/utilities/operators/${query.operator}`,
    {
      method: 'POST',
      signal: abortSignal,
      headers,
      body: JSON.stringify(payload),
    }
  );

  const data = (await response.json()) as APIResponse;

  if (!response.ok || !data.data) {
    return Promise.reject(
      new XLDError(
        data.message || 'Failed to retrieve products.',
        response.status
      )
    );
  }

  return data.data;
}
