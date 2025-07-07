import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Honeybadger, HoneybadgerErrorBoundary } from "@honeybadger-io/react"

const config = {
  apiKey: "hbp_NyhduFJHTQeKHug2fIj3PGNRGe0Mr13jpFWh",
  environment: "production"
}

const honeybadger = Honeybadger.configure(config)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HoneybadgerErrorBoundary honeybadger={honeybadger}>
      <App />
    </HoneybadgerErrorBoundary>
  </React.StrictMode>
);
