import { getClientConfigManager } from './clientConfig';

export type Environment = 'development' | 'production';

interface Config {
  environment: Environment;
}

let configManager: ConfigManager;

class ConfigManager {
  private config: Config;

  private authToken: string | null = null;

  constructor(config: Config) {
    if (configManager) {
      throw new Error('Cannot create more than one ConfigManager instance.');
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
    getClientConfigManager().setEnvironment(environment);

    return this;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;

    return this;
  }

  getAuthToken() {
    return this.authToken;
  }
}

type Options = Partial<Config>;

export function getConfigManager(config = {} as Options) {
  if (configManager) {
    if (config && config.environment) {
      configManager.setEnvironment(config.environment);
    }

    return configManager;
  }

  const { environment = 'development' } = config;

  configManager = new ConfigManager({ environment });

  return configManager;
}
