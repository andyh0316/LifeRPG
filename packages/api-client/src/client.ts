import createClient from 'openapi-fetch';
import type { paths } from '../generated/openapi.d.ts';

export const api = createClient<paths>({ baseUrl: '/' });
