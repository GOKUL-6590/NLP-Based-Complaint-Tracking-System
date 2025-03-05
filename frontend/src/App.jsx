import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import NotificationPermission from "./components/NotificationPermission";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import ManageTickets from "./pages/Admin/ManageTickets/ManageTickets";
import AssignedTickets from "./pages/Technician/AssignedTickets/AssignedTickets";
import Settings from "./pages/Settings/Settings";
import TicketHistory from "./pages/TicketHistory/TicketHistory";
import WorkHistory from "./pages/Technician/WorkHistory/WorkHistory";
import AdminReports from "./pages/Admin/AnalyticsAndReports/AdminReports";
import Inventory from "./pages/Admin/Inventory/Inventory";
import TechnicianDashboard from "./pages/Technician/Dashboard/TechnicianDashboard";
import Spinner from "./Spinner/Spinner";
import { useSelector } from "react-redux";
import TicketDetails from "./pages/TicketPage/TicketPage";
const firebaseConfig = {
  apiKey: "AIzaSyD-JBtXIwsepQCkVykF7ZTaBR_tHYp_xM8",
  authDomain: "complainttrackingsystem-8bf08.firebaseapp.com",
  projectId: "complainttrackingsystem-8bf08",
  storageBucket: "complainttrackingsystem-8bf08.firebaseapp.com",
  messagingSenderId: "72943845864",
  appId: "1:72943845864:web:aa7a5620f19da48964245d"
};


function App() {

  const { loading } = useSelector((state) => state.alerts);

  return (


    <Router>
      {loading && <Spinner />}
      <Toaster position="top-center" reverseOrder={false} />
      <NotificationPermission />
      <Routes>



        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with Navbar */}
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
