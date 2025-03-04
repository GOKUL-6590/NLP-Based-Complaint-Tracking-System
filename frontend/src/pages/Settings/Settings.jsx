import React, { useState } from "react";
import "./Settings.css";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast"; // For better notifications
import { updateUserPassword } from "../../service/auth_service";

const Settings = () => {
    const { user } = useSelector((state) => state.user);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notifications, setNotifications] = useState(true);
    const dispatch = useDispatch()

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // Client-side validation
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
                // Reset form
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

    const handleNotificationToggle = () => {
        setNotifications(!notifications);
        toast.success(`Notifications ${notifications ? "disabled" : "enabled"}`);
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