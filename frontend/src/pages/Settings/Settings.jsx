import React, { useState } from "react";
import "./Settings.css";
import { useSelector } from "react-redux";

const Settings = () => {
    const { user } = useSelector((state) => state.user);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notifications, setNotifications] = useState(true);

    const handlePasswordChange = (e) => {
        e.preventDefault();

        if (oldPassword !== user.password) {
            alert("Incorrect old password!");
            return;
        }

        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        alert("Password updated successfully!");
    };

    const handleNotificationToggle = () => {
        setNotifications(!notifications);
        alert(`Notifications ${notifications ? "disabled" : "enabled"}`);
    };

    return (
        <div class="settings-page">
            <div class="settings-container">



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
                            {notifications ? "Disable Notifications" : "Enable Notifications"}
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
