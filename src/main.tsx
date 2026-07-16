import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import './index.css'
import "./styles/styles.css";
import "./styles/milestone2.css";
import "./styles/milestone3.css";
import "./styles/milestone4.css";
import "./styles/milestone5.css";
import "./styles/milestone6.css";
import "./styles/production.css";
import "./styles/settings.css";
import "./styles/pagination.css";

const client = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: true },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
