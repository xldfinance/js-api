export type Environment = 'development' | 'production';

interface Config {
  environment: Environment;
}

let clientConfigManager: ClientConfigManager;

class ClientConfigManager {
  private config: Config;

  constructor(config: Config) {
    if (clientConfigManager) {
      throw new Error(
        'Cannot create more than one ClientConfigManager instance.'
      );
    }

    this.config = config;
  }

  get environment() {
    return this.config.environment;
  }

  setEnvironment(environment: Environment) {
    if (!environment) {
      throw new Error('environment option is required.');
    }

    if (!['production', 'development'].includes(environment)) {
      throw new Error(
        `Passed "${environment}" for environment option. Valid values are "development" or "production".`
      );
    }

    this.config.environment = environment;

    return this;
  }
}

export function getClientConfigManager() {
  if (!clientConfigManager) {
    clientConfigManager = new ClientConfigManager({
      environment: 'development',
    });
  }

  return clientConfigManager;
}
