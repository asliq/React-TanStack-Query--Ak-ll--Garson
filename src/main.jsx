import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// TanStack Query Client - Akıllı cache ve retry stratejisi
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Veri 5 dakika boyunca "fresh" kabul edilir
      staleTime: 1000 * 60 * 5,
      // Cache 30 dakika boyunca saklanır
      gcTime: 1000 * 60 * 30,
      // Ağ hatası durumunda 3 kez dene
      retry: 3,
      // Sayfa odağı değiştiğinde yeniden fetch
      refetchOnWindowFocus: true,
      // Bağlantı yeniden kurulduğunda fetch
      refetchOnReconnect: true,
    },
    mutations: {
      // Mutasyon hatalarında retry yapma
      retry: 0,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)

