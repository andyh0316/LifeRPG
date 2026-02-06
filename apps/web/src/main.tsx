import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initApiClient, api } from '@life-rpg/api-client';
import './index.css';
import App from './App';

const queryClient = new QueryClient();

initApiClient({ baseUrl: import.meta.env.VITE_API_URL ?? '/api' });

api.use({
  async onResponse({ response, schemaPath }) {
    if (response.status === 401 && schemaPath !== '/auth/me') {
      queryClient.invalidateQueries({ queryKey: ['get', '/auth/me'] });
    }
    return response;
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
