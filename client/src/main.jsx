import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  border: '4px solid black',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 600,
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
