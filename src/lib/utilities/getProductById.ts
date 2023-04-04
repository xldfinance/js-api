import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';
import type { Currency } from '../wallet';

export interface Product {
  name: string;
  id: number;
  operator: string;
  amount: number;
  currency: Currency;
  price: number;
  token_symbol: string;
  token_price: number;
}

interface APIResponse {
  message: string;
  data: Product | null;
  copyright: string;
}

export interface GetProductByIdOptions {
  abortSignal?: RequestInit['signal'];
  query: {
    product_id: string;
  };
  payload: {
    token_symbol: string;
    chain_id: string;
  };
}

export async function getProductById(
  options: GetProductByIdOptions
): Promise<Product> {
  const { headers } = new HeadersBuilder();
  const {
    abortSignal,
    query = { product_id: '' },
    payload = {},
  } = options || {};
  const response = await fetch(
    `${baseAPI}/utilities/operators/product/${query.product_id}`,
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
        data.message || 'Failed to retrieve product.',
        response.status
      )
    );
  }

  return data.data;
}
