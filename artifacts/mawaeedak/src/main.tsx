import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerApiAuth } from "./lib/apiAuth";

registerApiAuth();

createRoot(document.getElementById("root")!).render(<App />);
