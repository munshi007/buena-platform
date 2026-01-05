import createClient from 'openapi-fetch';
import type { paths } from './api';

export const client = createClient<paths>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
});
