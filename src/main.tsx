import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n";
import "./index.css";
import App from "./App";
import SearchPage from "./pages/SearchPage";
import ClipboardPage from "./pages/ClipboardPage";

const hash = window.location.hash;

function chooseRoot() {
  if (hash === "#search") return <SearchPage />;
  if (hash === "#clipboard") return <ClipboardPage />;
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>{chooseRoot()}</React.StrictMode>,
);
