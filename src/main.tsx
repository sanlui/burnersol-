import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App defaultLanguage="en" />} />
        <Route path="/en" element={<Navigate to="/" replace />} />
        <Route path="/en/" element={<Navigate to="/" replace />} />
        <Route path="/it" element={<Navigate to="/it/" replace />} />
        <Route path="/it/" element={<App defaultLanguage="it" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);