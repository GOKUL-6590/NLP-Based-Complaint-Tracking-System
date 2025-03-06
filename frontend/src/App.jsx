import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import './App.css';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar/Navbar';
import AdminDashboard from "./pages/Admin/AdminDashBoard/AdminDasboard";
import ManageUsers from "./pages/Admin/ManageUsers/Manageusers";
import Notifications from "./components/Notifications/Notifications";
import RaiseTicket from "./pages/RaiseTicket/RaiseTicket";
import { Toaster } from "react-hot-toast";
import ManageTickets from "./pages/Admin/ManageTickets/ManageTickets";
import AssignedTickets from "./pages/Technician/AssignedTickets/AssignedTickets";
import Settings from "./pages/Settings/Settings";
import TicketHistory from "./pages/TicketHistory/TicketHistory";
import WorkHistory from "./pages/Technician/WorkHistory/WorkHistory";
import AdminReports from "./pages/Admin/AnalyticsAndReports/AdminReports";
import Inventory from "./pages/Admin/Inventory/Inventory";
import TechnicianDashboard from "./pages/Technician/Dashboard/TechnicianDashboard";
import Spinner from "./Spinner/Spinner";
import TicketDetails from "./pages/TicketPage/TicketPage";

function App() {
  const { user } = useSelector((state) => state.user);
  const [subscribed, setSubscribed] = useState(false);
  const { loading } = useSelector((state) => state.alerts);
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          const isSubscribed = localStorage.getItem('pushSubscribed') === 'true';
          setSubscribed(isSubscribed);
        })
        .catch((error) => console.error('Service Worker registration failed:', error));
    }
  }, []);

  const askPermissionAndSubscribe = async (userId) => {
    console.log('VITE_VAPID_PUBLIC_KEY:', import.meta.env.VITE_VAPID_PUBLIC_KEY); // Debug
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
      });

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, subscription }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Subscription failed:', result.message);
      } else {
        console.log('Subscribed successfully:', result.message);
        setSubscribed(true);
        localStorage.setItem('pushSubscribed', 'true');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    if (!base64String) {
      throw new Error('VAPID public key is undefined or empty');
    }
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleSubscribe = () => {
    if (user?.id && !subscribed) {
      askPermissionAndSubscribe(user.id);
    }
  };

  // ... rest of your App.jsx (Router, Routes, etc.)
  return (
    <Router>
      {loading && <Spinner />}
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Navbar>

                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<ManageUsers />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
                  <Route path="/new-ticket" element={<RaiseTicket />} />
                  <Route path="/admin/tickets" element={<ManageTickets />} />
                  <Route path="/technician/assigned-tickets" element={<AssignedTickets />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/ticket-history" element={<TicketHistory />} />
                  <Route path="/technician/work-history" element={<WorkHistory />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route path="/admin/inventory" element={<Inventory />} />
                  <Route path="/ticket/:ticketId" element={<TicketDetails />} />
                </Routes>

              </Navbar>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;