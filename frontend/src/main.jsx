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
const firebaseConfig = {
  apiKey: "AIzaSyD-JBtXIwsepQCkVykF7ZTaBR_tHYp_xM8",
  authDomain: "complainttrackingsystem-8bf08.firebaseapp.com",
  projectId: "complainttrackingsystem-8bf08",
  storageBucket: "complainttrackingsystem-8bf08.firebaseapp.com",
  messagingSenderId: "72943845864",
  appId: "1:72943845864:web:aa7a5620f19da48964245d"
};
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("../public/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered:", registration);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BJHJXiz83xlAzyzk9jRhOaOd9fbuL6oyE96Y_wExtE1ZyMjlpUyDr0Hb0AbKYEYJHG-xHEdSv7EcB3szhZ40Uoo",
      });
      console.log("FCM Token:", token);
    } else {
      console.log("Permission denied");
    }
  } catch (error) {
    console.error("Error retrieving FCM token:", error);
  }
};

// Listen for messages while app is open
onMessage(messaging, (payload) => {
  console.log("Foreground message received:", payload);
});

createRoot(document.getElementById('root')).render(




  // Initialize Firebase

  // Register the service worker


  // Request notification permission & get token


  <StrictMode>
    <Provider store={store}>

      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
