import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";

import '@fortawesome/fontawesome-free/css/all.min.css';
import { store, persistor } from "./redux/store.jsx";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";





createRoot(document.getElementById('root')).render(


  <StrictMode>
    <Provider store={store}>

      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
