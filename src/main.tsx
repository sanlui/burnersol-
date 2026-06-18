import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import { LanguageProvider } from "./contexts/LanguageContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider initialLanguage="en">
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);