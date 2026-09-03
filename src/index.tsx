import React from "react";
import ReactDOM from "react-dom";
import "react-day-picker/lib/style.css";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { akitaDevtools } from "@datorama/akita";

if (process.env.NODE_ENV === "development") {
  akitaDevtools();
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
