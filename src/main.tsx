import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import i18n from "./i18n";

import { I18nextProvider } from "react-i18next";
import "normalize.css";

import "./styles/index.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </I18nextProvider>
  </StrictMode>
);
