import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Add for navigation
import "./Notifications.css";
import socket from "../socket";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = useSelector((state) => state.user);
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        if (!user || !user.id) {
            console.error("User ID not available");
            setLoading(false);
            return;
        }

        socket.emit("join", user.id);

        const fetchNotifications = async () => {
            try {
                const response = await axios.get("http://localhost:5000/users/notifications", {
                    params: { receiver_id: user.id },
                });
                setNotifications(response.data.notifications || []); // Ensure array if undefined
            } catch (error) {
                console.error("Error fetching notifications:", error);
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

        // Optional: Listen for real-time updates via socket (if implemented in backend)
        socket.on("notification", (newNotification) => {
            setNotifications((prev) => [newNotification, ...prev]);
        });

        // Cleanup socket listener
        return () => {
            socket.off("notification");
        };
    }, [user]);

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`http://localhost:5000/users/notifications/read/${notificationId}?userId=${user.id}`);
            socket.emit("unread-notifications", user.id);

            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === notificationId ? { ...notif, is_read: true } : notif
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post(
                "http://localhost:5000/users/notifications/read-all",
                { receiver_id: user.id },
                { headers: { "Content-Type": "application/json" } }
            );
            socket.emit("unread-notifications", user.id);
            setNotifications((prev) =>
                prev.map((notif) => ({ ...notif, is_read: true }))
            );
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const deleteAllNotifications = async () => {
        try {
            await axios.delete("http://localhost:5000/users/notifications/delete-all", {
                data: { receiver_id: user.id },
            });
            socket.emit("unread-notifications", user.id);
            setNotifications([]);
        } catch (error) {
            console.error("Error deleting all notifications:", error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (notification.link_url) {
            navigate(notification.link_url); // Navigate to link_url
            if (!notification.is_read) {
                markAsRead(notification.id); // Mark as read if unread
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="notification-container">
            <div className="notification-header">
                <h2>Notifications</h2>
                <div className="header-buttons">
                    <button
                        onClick={markAllAsRead}
                        disabled={notifications.every((n) => n.is_read)}
                    >
                        Mark All as Read
                    </button>
                    <button onClick={deleteAllNotifications}>Delete All</button>
                </div>
            </div>
            {notifications.length === 0 ? (
                <p className="no-notifications">No notifications available.</p>
            ) : (
                <ul className="notification-list">
                    {notifications.map((notification) => (
                        <li
                            key={notification.id}
                            className={`notification-item ${notification.is_read ? "read" : "unread"}`}
                            onClick={() => handleNotificationClick(notification)} // Click handler
                            style={{ cursor: notification.link_url ? "pointer" : "default" }} // Indicate clickable
                        >
                            <div className="notification-content">
                                <strong>{notification.sender_name}:</strong> {notification.message}
                                <span className="timestamp">
                                    {new Date(notification.timestamp).toLocaleString()}
                                </span>
                                {!notification.is_read && (
                                    <button
                                        className="mark-as-read"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering li click
                                            markAsRead(notification.id);
                                        }}
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Notifications;