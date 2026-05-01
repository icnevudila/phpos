import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { SkipToMainLink } from "./components/SkipToMainLink";
import App from "./App";
import "./i18n";
import "./index.css";
import { ThemeProvider } from "./theme/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <SkipToMainLink />
        <App />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
