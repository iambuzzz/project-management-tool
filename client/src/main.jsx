import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

// Suppress the @hello-pangea/dnd nested scroll container warning
// Trello clones unavoidably have nested scroll containers (horizontal board + vertical lists)
// This warning is a development-only message and harmless.
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('unsupported nested scroll container')) {
    return;
  }
  originalWarn(...args);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 seconds — keeps UI fresh
      retry: 1,             // Only retry once on failure
      refetchOnMount: true,
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
