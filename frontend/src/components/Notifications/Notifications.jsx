import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./Notifications.css";
import socket from "../socket";
import { hideLoading, showLoading } from "../../redux/alertSlice";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true); // Ensure this is defined

    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!user || !user.id) {
            console.error("User ID not available");
            setLoading(false);
            return;
        }

        socket.emit("join", user.id);

        const fetchNotifications = async () => {
            try {
                dispatch(showLoading());
                const response = await axios.get("http://localhost:5000/users/notifications", {
                    params: { receiver_id: user.id },
                });
                setNotifications(response.data.notifications || []);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                setNotifications([]);
            } finally {
                dispatch(hideLoading());
                setLoading(false);
            }
        };

        fetchNotifications();

        socket.on("notification", (newNotification) => {
            setNotifications((prev) => [newNotification, ...prev]);
        });

        return () => {
            socket.off("notification");
        };
    }, [user, dispatch]);

    const markAsRead = async (notificationId) => {
        try {
            dispatch(showLoading());
            await axios.post(`http://localhost:5000/users/notifications/read/${notificationId}?userId=${user.id}`);
            dispatch(hideLoading());
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
            dispatch(showLoading());
            await axios.post(
                "http://localhost:5000/users/notifications/read-all",
                { receiver_id: user.id },
                { headers: { "Content-Type": "application/json" } }
            );
            dispatch(hideLoading());
            socket.emit("unread-notifications", user.id);
            setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const deleteAllNotifications = async () => {
        try {
            dispatch(showLoading());
            await axios.delete("http://localhost:5000/users/notifications/delete-all", {
                data: { receiver_id: user.id },
            });
            dispatch(hideLoading());
            socket.emit("unread-notifications", user.id);
            setNotifications([]);
        } catch (error) {
            console.error("Error deleting all notifications:", error);
        }
    };

    const handleNotificationClick = (notification) => {
        console.log("Notification clicked:", notification.id, "is_read:", notification.is_read, "link_url:", notification.link_url);
        if (notification.link_url) {
            navigate(notification.link_url);
            if (!notification.is_read) {
                markAsRead(notification.id);
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
                            onClick={() => handleNotificationClick(notification)}
                            style={{ cursor: notification.link_url ? "pointer" : "default" }}
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
                                            e.stopPropagation();
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