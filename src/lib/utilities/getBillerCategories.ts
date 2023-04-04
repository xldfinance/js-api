import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';

export interface BillerCategory {
  code: string;
  active: boolean;
  service: string;
  name: string;
  countries: string[];
  icon: string | null;
}

interface APIResponse {
  message: string;
  data: BillerCategory[] | null;
  copyright: string;
}

export interface GetBillerCategoriesOptions {
  abortSignal?: RequestInit['signal'];
  query: {
    country: string;
  };
}

export async function getBillerCategories(
  options: GetBillerCategoriesOptions
): Promise<BillerCategory[]> {
  const { headers } = new HeadersBuilder();
  const { abortSignal, query = { country: '' } } = options || {};
  const response = await fetch(
    `${baseAPI}/utilities/categories/${query.country}`,
    {
      signal: abortSignal,
      headers,
    }
  );

  const data = (await response.json()) as APIResponse;

  if (!response.ok || !data.data) {
    return Promise.reject(
      new XLDError(
        data.message || 'Failed to retrieve biller categories.',
        response.status
      )
    );
  }

  return data.data;
}
