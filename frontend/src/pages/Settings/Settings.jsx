import React, { useState, useEffect } from "react";
import "./Settings.css";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateUserPassword } from "../../service/auth_service";

const Settings = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const isSubscribed = localStorage.getItem('pushSubscribed') === 'true';
    setNotificationsEnabled(isSubscribed);
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    try {
      const response = await updateUserPassword(user.id, oldPassword, newPassword);
      if (response.success) {
        toast.success(response.message || "Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.message || "Failed to update password.");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while updating the password.");
    }
  };

  const askPermissionAndSubscribe = async (userId) => {
    console.log('VITE_VAPID_PUBLIC_KEY:', import.meta.env.VITE_VAPID_PUBLIC_KEY);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
      });

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
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
        toast.error('Subscription failed: ' + result.message);
      } else {
        toast.success('Subscribed successfully: ' + result.message);
        setNotificationsEnabled(true);
        localStorage.setItem('pushSubscribed', 'true');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to enable notifications');
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

  const handleNotificationToggle = () => {
    if (!notificationsEnabled && user?.id) {
      askPermissionAndSubscribe(user.id);
    } else {
      // Optional: Add unsubscribe logic here if needed
      setNotificationsEnabled(false);
      localStorage.setItem('pushSubscribed', 'false');
      toast.success('Notifications disabled');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h2 className="settings-header">Settings</h2>
        <div className="settings-grid">
          {/* Profile Section */}
          <div className="settings-card">
            <h3>Profile Settings</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>

          {/* Change Password */}
          <div className="settings-card">
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordChange} className="password-form">
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit">Update Password</button>
            </form>
          </div>

          {/* Notifications */}
          <div className="settings-card">
            <h3>Notifications</h3>
            <button className="toggle-btn" onClick={handleNotificationToggle}>
              {notificationsEnabled ? "Disable Notifications" : "Enable Notifications"}
            </button>
          </div>

          {/* Admin Settings */}
          {user.role === "admin" && (
            <div className="settings-card">
              <h3>Admin Settings</h3>
              <p>Manage system-wide configurations here.</p>
            </div>
          )}

          {/* Technician Settings */}
          {user.role === "technician" && (
            <div className="settings-card">
              <h3>Technician Settings</h3>
              <p>Configure your work schedule and availability.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;