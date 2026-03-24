import Pocketbase from 'pocketbase';

/**
 * PocketBase Client Configuration
 * 
 * - In Development: Defaults to "/hcgi/platform" (proxied to your local PocketBase).
 * - In Production: Defaults to your live PocketHost instance.
 * - Always overridable via VITE_POCKETBASE_URL environment variable.
 */
const POCKETBASE_API_URL = 
  import.meta.env.VITE_POCKETBASE_URL || 
  (import.meta.env.DEV ? "/hcgi/platform" : "https://focusfloww.pockethost.io/");

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

export default pocketbaseClient;

export { pocketbaseClient };
