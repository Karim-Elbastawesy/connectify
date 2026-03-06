import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import { ToastProvider } from "@heroui/react";
import { TokenContextProvider } from "./components/context/tokenContext.jsx";
import { UserProvider } from "./components/context/userContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TokenContextProvider>
      <UserProvider>
        <ToastProvider placement="top-right" />
        <App />
      </UserProvider>
    </TokenContextProvider>
  </StrictMode>,
);
