import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n";
import "./index.css";
import App from "./App";
import SearchPage from "./pages/SearchPage";

const isSearch = window.location.hash === "#search";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>{isSearch ? <SearchPage /> : <App />}</React.StrictMode>,
);
