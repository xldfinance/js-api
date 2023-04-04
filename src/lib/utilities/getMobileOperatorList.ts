import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';

export interface MobileOperator {
  country: string;
  id: number;
  identified: boolean;
  name: string;
  icon: string | null;
}

interface APIResponse {
  message: string;
  data: MobileOperator[] | null;
  copyright: string;
}

export interface GetMobileOperatorListOptions {
  abortSignal?: RequestInit['signal'];
  query: {
    mobile: string;
  };
}

export async function getMobileOperatorList(
  options: GetMobileOperatorListOptions
): Promise<MobileOperator[]> {
  const { headers } = new HeadersBuilder();
  const { abortSignal, query = { mobile: '' } } = options || {};
  const response = await fetch(
    `${baseAPI}/utilities/operators/mobile/${query.mobile}`,
    {
      signal: abortSignal,
      headers,
    }
  );

  const data = (await response.json()) as APIResponse;

  if (!response.ok || !data.data) {
    return Promise.reject(
      new XLDError(
        data.message || 'Failed to retrieve mobile operator list.',
        response.status
      )
    );
  }

  return data.data;
}
