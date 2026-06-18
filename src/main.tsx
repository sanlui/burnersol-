import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import App from "./App.tsx";
import { LanguageProvider, getLanguageFromPath, supportedLanguages, type LanguageCode } from "./contexts/LanguageContext.tsx";
import "./index.css";

function LanguageRouteHandler({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const lang = getLanguageFromPath(location.pathname);

  return (
    <LanguageProvider initialLanguage={lang} initialPath={location.pathname}>
      {children}
    </LanguageProvider>
  );
}

function AppWrapper() {
  const location = useLocation();

  return (
    <App />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageRouteHandler>
        <Routes>
          {/* English - default / */}
          <Route path="/" element={<AppWrapper />} />
          
          {/* All other languages with prefix */}
          {supportedLanguages.filter(l => l.code !== "en").map(lang => (
            <Route key={lang.code} path={`/${lang.code}/*`} element={<AppWrapper />} />
          ))}
          
          {/* Catch all - redirect to / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LanguageRouteHandler>
    </BrowserRouter>
  </StrictMode>
);