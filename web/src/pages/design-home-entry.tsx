import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import { DesignHome } from "./DesignHome";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DesignHome />
  </StrictMode>,
);