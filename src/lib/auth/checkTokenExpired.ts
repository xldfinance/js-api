import { getConfigManager } from '../config';
import { XLDError } from '../errors';

export function checkTokenExpired(error: unknown) {
  if (error instanceof XLDError && error.statusCode === 401) {
    getConfigManager().setAuthToken(null);
  } else if (error instanceof Error) {
    if (
      error.message.toLowerCase().includes('the incoming token has expired')
    ) {
      getConfigManager().setAuthToken(null);
    }
  }
}
