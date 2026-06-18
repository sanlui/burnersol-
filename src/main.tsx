import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import App from "./App.tsx";
import { LanguageProvider, getLanguageFromPath } from "./contexts/LanguageContext.tsx";
import "./index.css";

function LanguageRouteHandler() {
  const location = useLocation();
  const lang = getLanguageFromPath(location.pathname);
  return (
    <LanguageProvider initialLanguage={lang}>
      <App defaultLanguage={lang} />
    </LanguageProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LanguageRouteHandler />} />
        <Route path="/en" element={<Navigate to="/" replace />} />
        <Route path="/en/" element={<Navigate to="/" replace />} />
        <Route path="/it/*" element={<LanguageRouteHandler />} />
        <Route path="/es/*" element={<LanguageRouteHandler />} />
        <Route path="/zh/*" element={<LanguageRouteHandler />} />
        <Route path="/ja/*" element={<LanguageRouteHandler />} />
        <Route path="/de/*" element={<LanguageRouteHandler />} />
        <Route path="/fr/*" element={<LanguageRouteHandler />} />
        <Route path="/ru/*" element={<LanguageRouteHandler />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);