import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import DebugDBPage from "./pages/DebugDBPage"; 
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename="/APP-presupuesto-V3">
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/debugdb" element={<DebugDBPage />} />
    </Routes>
  </BrowserRouter>
);