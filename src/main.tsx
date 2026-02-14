import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <App />
);
//eliminamos el splash inmediatamente despues
const splash = document.getElementById("splash");
if (splash) {
    splash.remove();
}
