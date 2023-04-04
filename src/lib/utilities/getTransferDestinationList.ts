import { baseAPI } from '../constants';
import { XLDError } from '../errors';
import { HeadersBuilder } from '../initHeaders';

export interface TransferDestinationExtraField {
  value: string;
  label: string;
}

export interface TransferDestinationExtraFieldValues {
  values: TransferDestinationExtraField[];
}

export interface TransferDestinationExtraFields {
  field: string;
  field_type: string;
  required: boolean;
  type: string;
  label: string;
  placeholder?: string | null;
  regex?: string | null;
  regexType?: string | null;
  data?: TransferDestinationExtraFieldValues | null;
  max_length?: number | null;
  min_length?: number | null;
  value?: string | TransferDestinationExtraField;
  error?: string;
}

export interface TransferDestination {
  destination: string;
  code: string;
  country: string;
  active: boolean;
  extra_fields: TransferDestinationExtraFields[];
  icon: string | null;
}

interface APIResponse {
  message: string;
  data: TransferDestination[] | null;
  copyright: string;
}

export interface GetTransferDestinationListOptions {
  abortSignal?: RequestInit['signal'];
  query: {
    country: string;
  };
}

export async function getTransferDestinationList(
  options: GetTransferDestinationListOptions
): Promise<TransferDestination[]> {
  const { headers } = new HeadersBuilder();
  const { abortSignal, query = { country: '' } } = options || {};
  const response = await fetch(
    `${baseAPI}/utilities/destinations/${query.country}`,
    {
      signal: abortSignal,
      headers,
    }
  );

  const data = (await response.json()) as APIResponse;

  if (!response.ok || !data.data) {
    return Promise.reject(
      new XLDError(
        data.message || 'Failed to retrieve transfer destination list.',
        response.status
      )
    );
  }

  return data.data;
}
