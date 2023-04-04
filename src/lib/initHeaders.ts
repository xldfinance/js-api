import type { Environment } from './clientConfig';
import { getClientConfigManager } from './clientConfig';
import { XLDError } from './errors';

export class HeadersBuilder {
  private httpHeaders: Map<string, string>;

  constructor() {
    this.httpHeaders = new Map<string, string>([
      ['Content-Type', 'application/json'],
      ['environment', getClientConfigManager().environment],
    ]);
  }

  withAuth(token?: string | null) {
    if (!token) {
      throw new XLDError(
        'Failed to get authentication token, please authenticate first.',
        401
      );
    }

    this.httpHeaders.set('Authorization', token);

    return this;
  }

  withEnvironment(environment: Environment) {
    if (!environment) {
      throw new XLDError('environment header is required.', 400);
    }

    this.httpHeaders.set('environment', environment);

    return this;
  }

  get headers() {
    return this.httpHeaders as unknown as Headers;
  }
}
