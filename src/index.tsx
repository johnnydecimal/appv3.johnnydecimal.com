// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import React from "react";
import ReactDOM from "react-dom";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { App } from "./App";

// === Styles   ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import "./index.css";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
