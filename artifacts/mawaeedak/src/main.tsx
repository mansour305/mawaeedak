import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/mawaeedak-reference.css";
import { registerApiAuth } from "./lib/apiAuth";

registerApiAuth();

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("[Mawaeedak] ERROR: #root element not found!");
} else {
  createRoot(rootElement).render(<App />);
}
