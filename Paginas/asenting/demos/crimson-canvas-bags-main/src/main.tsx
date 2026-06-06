import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ContentProvider } from "@/context/ContentContext";

createRoot(document.getElementById("root")!).render(
  <ContentProvider>
    <App />
  </ContentProvider>
);
