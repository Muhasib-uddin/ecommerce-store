import React from 'react'
import ReactDOM from "react-dom/client"
import App from './App.jsx'
import * as serviceWorker from "./serviceWorker"
import { BrowserRouter } from 'react-router-dom'
import "./i18n"
import { Provider } from 'react-redux'
import store from './store/index.js'

import { BrandingProvider } from './context/BrandingContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.Fragment>
    <Provider store={store}>
      <BrandingProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </BrandingProvider>
    </Provider>
  </React.Fragment>,
);

serviceWorker.unregister()