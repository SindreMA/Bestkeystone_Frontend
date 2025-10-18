// Runtime configuration loader
interface AppConfig {
  apiUrl: string;
}

let configCache: AppConfig | null = null;
let configPromise: Promise<AppConfig> | null = null;

/**
 * Loads configuration from /config.json at runtime
 * This allows changing the API URL without rebuilding the application
 */
export async function loadConfig(): Promise<AppConfig> {
  // Return cached config if already loaded
  if (configCache) {
    return configCache;
  }

  // Return existing promise if already loading
  if (configPromise) {
    return configPromise;
  }

  // Load config from public/config.json
  configPromise = fetch('/config.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load config.json');
      }
      return response.json();
    })
    .then((config: AppConfig) => {
      configCache = config;
      return config;
    })
    .catch(error => {
      console.error('Error loading config, using defaults:', error);
      // Fallback to default configuration
      configCache = {
        apiUrl: 'https://bestkeystone.com/api'
      };
      return configCache;
    });

  return configPromise;
}

/**
 * Gets the cached config synchronously
 * Note: loadConfig() must be called first during app initialization
 */
export function getConfig(): AppConfig {
  if (!configCache) {
    throw new Error('Config not loaded yet. Call loadConfig() first during app initialization.');
  }
  return configCache;
}
