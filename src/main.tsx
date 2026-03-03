import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import DebugDBPage from "./pages/DebugDBPage"; 
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/debugdb" element={<DebugDBPage />} />
    </Routes>
  </HashRouter>
);