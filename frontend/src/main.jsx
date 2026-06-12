// ── React Application Entry Point ────────────────────────────────────
// Mounts the root App component into the DOM and imports global styles.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ── Mount React to the #root element ────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
