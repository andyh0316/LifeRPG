import createClient from 'openapi-fetch';
import createQueryClient from 'openapi-react-query';
import type { paths } from '../generated/openapi.d.ts';

export interface ApiClientOptions {
  baseUrl: string;
}

/** Raw OpenAPI fetch client for imperative HTTP calls */
export let api: ReturnType<typeof createClient<paths>>;
/** React Query wrapper providing hooks (useQuery, useMutation, etc.) */
export let $api: ReturnType<typeof createQueryClient<paths>>;

let initialized = false;

/** Call once at app startup before any component renders. */
export function initApiClient(opts: ApiClientOptions) {
  if (initialized) {
    throw new Error('initApiClient() has already been called');
  }
  initialized = true;
  api = createClient<paths>({ baseUrl: opts.baseUrl, credentials: 'include' });
  $api = createQueryClient(api);
}
