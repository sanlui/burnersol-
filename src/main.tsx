import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SolanaWalletProvider from "./providers/SolanaWalletProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

const App = lazy(() => import("./App"));
const InfoPage = lazy(() => import("./pages/InfoPage"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-dark-obsidian flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-flame-orange border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Loading...</p>
      </div>
    </div>
  );
}

function AppErrorFallback() {
  return (
    <div className="min-h-screen bg-dark-obsidian text-slate-300 antialiased font-sans flex flex-col items-center justify-center">
      <div className="text-center space-y-6 p-8 max-w-lg">
        <h1 className="text-4xl font-display font-black italic text-white">Protocol Error</h1>
        <p className="text-slate-400 text-sm">Failed to load the application. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-flame-orange hover:bg-orange-600 text-black font-display font-bold text-xs tracking-wider uppercase transition-all"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SolanaWalletProvider>
        <ErrorBoundary fallback={<AppErrorFallback />}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/protocol" element={<App />} />
              <Route path="/reclaim-sol" element={<InfoPage sectionId="rent-recovery" />} />
              <Route path="/how-it-works" element={<InfoPage sectionId="how-it-works" />} />
              <Route path="/about" element={<InfoPage sectionId="about-us" />} />
              <Route path="/faq" element={<InfoPage sectionId="faq" />} />
              <Route path="/security" element={<InfoPage sectionId="security" />} />
              <Route path="/contact" element={<InfoPage sectionId="contacts" />} />
              <Route path="/resources" element={<InfoPage sectionId="resources" />} />
              <Route path="/legal" element={<InfoPage sectionId="terms" />} />
              <Route path="/terms" element={<InfoPage sectionId="terms" />} />
              <Route path="/privacy" element={<InfoPage sectionId="privacy" />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </SolanaWalletProvider>
    </BrowserRouter>
  </StrictMode>
);