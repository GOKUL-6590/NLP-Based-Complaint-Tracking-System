// import React, { useEffect, useState } from 'react';
// import { initializeApp } from 'firebase/app';
// import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// const firebaseConfig = {
//     apiKey: "AIzaSyD-JBtXIwsepQCkVykF7ZTaBR_tHYp_xM8",
//     authDomain: "complainttrackingsystem-8bf08.firebaseapp.com",
//     projectId: "complainttrackingsystem-8bf08",
//     storageBucket: "complainttrackingsystem-8bf08.firebaseapp.com",
//     messagingSenderId: "72943845864",
//     appId: "1:72943845864:web:aa7a5620f19da48964245d"
// };

// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// const NotificationPermission = () => {
//     const [permissionGranted, setPermissionGranted] = useState(false);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         // Request notification permissions
//         console.log("in notify")
//         Notification.requestPermission()
//             .then(permission => {
//                 if (permission === 'granted') {
//                     console.log('Notification permission granted.');
//                     setPermissionGranted(true);
//                     registerToken();
//                 } else {
//                     console.error('Notification permission denied.');
//                     setError('Permission denied');
//                 }
//             })
//             .catch(error => {
//                 console.error('Error requesting notification permission:', error);
//                 setError('Error requesting permission');
//             });

//         // Listen for foreground messages
//         onMessage(messaging, payload => {
//             console.log('Foreground message received:', payload);
//             alert(`${payload.notification.title}: ${payload.notification.body}`);
//         });
//         console.log("in notify")
//     }, []);

//     const registerToken = () => {
//         getToken(messaging, { vapidKey: 'BJHJXiz83xlAzyzk9jRhOaOd9fbuL6oyE96Y_wExtE1ZyMjlpUyDr0Hb0AbKYEYJHG-xHEdSv7EcB3szhZ40Uoo' })
//             .then(currentToken => {
//                 if (currentToken) {
//                     console.log('FCM Token:', currentToken);
//                     saveTokenToServer(currentToken);
//                 } else {
//                     console.error('Failed to get FCM token.');
//                     setError('Failed to get token');
//                 }
//             })
//             .catch(error => {
//                 console.error('Error retrieving FCM token:', error);
//                 setError('Error retrieving token');
//             });
//     };

//     const saveTokenToServer = (token) => {
//         const user = JSON.parse(localStorage.getItem('user')); // Parse the stored user info

//         if (!user || !user.id) {
//             console.error('User ID is not available in local storage');
//             return;
//         }

//         fetch('http://localhost:5000/users/save-token', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 fcmToken: token,
//                 userId: user.id  // Send the user ID along with the FCM token
//             }),
//         })
//             .then(response => response.json())
//             .then(data => console.log('Server Response:', data))
//             .catch(error => {
//                 console.error('Error saving token:', error);
//                 setError('Error saving token');
//             });
//     };

//     return (
//         <div>

//         </div>
//     );
// };

// export default NotificationPermission;
