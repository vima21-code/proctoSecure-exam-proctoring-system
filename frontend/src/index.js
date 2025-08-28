import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Inside JSX:
<ToastContainer position="top-center" autoClose={2000} />


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    
      <Router>
        <App />
      </Router>
    
  </React.StrictMode>
);
