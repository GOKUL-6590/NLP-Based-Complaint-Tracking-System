importScripts("https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/10.5.2/firebase-messaging.js");

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyD-JBtXIwsepQCkVykF7ZTaBR_tHYp_xM8",
    authDomain: "complainttrackingsystem-8bf08.firebaseapp.com",
    projectId: "complainttrackingsystem-8bf08",
    storageBucket: "complainttrackingsystem-8bf08.firebaseapp.com",
    messagingSenderId: "72943845864",
    appId: "1:72943845864:web:aa7a5620f19da48964245d"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log("Received background message:", payload);

    const { title, body } = payload.notification;

    self.registration.showNotification(title, {
        body: body,
        icon: "/firebase-logo.png", // Optional icon
    });
});
