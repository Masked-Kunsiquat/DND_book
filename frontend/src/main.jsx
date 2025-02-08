import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Flowbite, ThemeModeScript } from "flowbite-react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeModeScript />
    <Flowbite>
      <App />
    </Flowbite>
  </React.StrictMode>
);
