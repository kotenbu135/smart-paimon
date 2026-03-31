import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initWasm } from "./wasm";
import "./i18n";
import "./index.css";

initWasm();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
