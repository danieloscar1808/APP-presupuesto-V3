import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <App />
);

// 2. Eliminamos el splash screen inmediatamente después
const splash = document.getElementById("splash");
if (splash) {
    splash.remove();
}
