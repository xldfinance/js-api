import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';

export interface BillerExtraField {
  label: string;
  value: string;
}

export interface BillerExtraFieldValues {
  values: BillerExtraField[];
}

export interface BillerExtraFields {
  field_name: string;
  field_type: string;
  is_required: boolean;
  label: string;
  type: string;
  data?: BillerExtraFieldValues | null;
  placeholder: string | null;
  regex?: string | null;
  regexType?: string | null;
  value?: string | BillerExtraField;
  error?: string;
}

export interface Biller {
  category: string;
  product: string;
  service: string;
  country: string;
  code: string;
  is_active: boolean;
  fields: BillerExtraFields[];
  icon: string;
  partner_id: string[];
}

interface APIResponse {
  message: string;
  data: Biller[] | null;
  copyright: string;
}

export interface GetBillerListOptions {
  abortSignal?: RequestInit['signal'];
  query: {
    country: string;
    category: string;
  };
}

export async function getBillerList(
  options: GetBillerListOptions
): Promise<Biller[]> {
  const { headers } = new HeadersBuilder();
  const { abortSignal, query = { category: '', country: '' } } = options || {};
  const response = await fetch(
    `${baseAPI}/utilities/categories/${query.country}/${query.category}`,
    {
      signal: abortSignal,
      headers,
    }
  );

  const data = (await response.json()) as APIResponse;

  if (!response.ok || !data.data) {
    return Promise.reject(
      new XLDError(
        data.message || 'Failed to retrieve billers list.',
        response.status
      )
    );
  }

  return data.data;
}
