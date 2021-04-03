// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { App } from "./App";

// === Styles   ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import "./index.css";
import "typeface-fira-code";
import "typeface-fira-sans";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
