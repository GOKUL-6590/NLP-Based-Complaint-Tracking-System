import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/ticket2.png";
import socket from "../socket";

function Navbar({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // New state for mobile detection
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const persistedUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;

    const role = (user || persistedUser)?.role;
    const isAdmin = role === "admin";
    const isTechnician = role === "technician";

    // Define menus for each role
    const adminMenu = [
        { name: "Dashboard", path: "/admin/dashboard", icon: "ri-dashboard-line" },
        { name: "Manage Users", path: "/admin/users", icon: "ri-group-line" },
        { name: "Manage Tickets", path: "/admin/tickets", icon: "ri-ticket-line" },
        { name: "Analytics & Reports", path: "/admin/reports", icon: "ri-bar-chart-line" },
        { name: "Inventory", path: "/admin/inventory", icon: "ri-archive-line" },
        { name: "Settings", path: "/settings", icon: "ri-settings-2-line" },
    ];

    const userMenu = [
        { name: "Dashboard", path: "/home", icon: "ri-dashboard-line" },
        { name: "New Ticket", path: "/new-ticket", icon: "ri-file-add-line" },
        { name: "Ticket History", path: "/ticket-history", icon: "ri-history-line" },
        { name: "Settings", path: "/settings", icon: "ri-settings-2-line" },
    ];

    const technicianMenu = [
        { name: "Dashboard", path: "/technician/dashboard", icon: "ri-dashboard-line" },
        { name: "Assigned Tickets", path: "/technician/assigned-tickets", icon: "ri-ticket-line" },
        { name: "Work History", path: "/technician/work-history", icon: "ri-history-line" },
        { name: "Settings", path: "/settings", icon: "ri-settings-2-line" },
    ];

    const menuToRender = isAdmin ? adminMenu : isTechnician ? technicianMenu : userMenu;

    const [notifications, setNotifications] = useState(0);

    // Handle resize to detect mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // 768px as the mobile breakpoint
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Socket for real-time notifications
    useEffect(() => {
        socket.emit("join", user?.id);

        socket.on("unread-notifications", (data) => {
            if (data.user_id === user?.id) {
                setNotifications(data.count);
            }
        });

        return () => {
            socket.off("unread-notifications");
        };
    }, [user]);

    // Fetch unread notifications count
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const userId = user?.id || persistedUser?.id;
                if (!userId) return;

                const response = await axios.get(
                    `http://localhost:5000/users/notifications/unread-count?user_id=${userId}`
                );
                if (response.data.success) {
                    setNotifications(response.data.count);
                }
            } catch (error) {
                console.error("Failed to fetch notifications count:", error);
            }
        };

        fetchNotifications();
    }, [user, persistedUser]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div className={`layout ${collapsed ? "collapsed" : ""}`}>
            {/* Sidebar */}
            <div className={`sidebar ${collapsed ? "collapsed-sidebar" : ""}`}>
                <div className="sidebar-header">
                    {collapsed ? (
                        <span className="app-name">
                            <img src={logo} alt="Logo" className="app-logo" />
                        </span>
                    ) : (
                        <>
                            <span className="app-name">
                                <img src={logo} alt="Logo" className="collapsed-app-logo" />
                                Tikify
                            </span>
                        </>
                    )}
                </div>
                <div className="menu">
                    {menuToRender.map((menu) => {
                        const isActive = location.pathname === menu.path;

                        return (
                            <div
                                className={`menu-item ${isActive ? "active" : ""} ${collapsed ? "collapsed-menu-item" : ""
                                    }`}
                                key={menu.name}
                                onClick={() => {
                                    navigate(menu.path);
                                    if (isMobile) setCollapsed(true); // Collapse only on mobile
                                }}
                            >
                                <i className={`ri ${menu.icon}`}></i>
                                {!collapsed && <span>{menu.name}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className={`content ${collapsed ? "collapsed-content" : ""}`}>
                {/* Topbar */}
                <div className="topbar">
                    <div className="topbar-left">
                        <button onClick={() => setCollapsed(!collapsed)} className="collapse-btn">
                            {collapsed ? (
                                <>
                                    <i className="ri-menu-line mobile-nav"></i>
                                    <i className="ri-arrow-right-s-line desktop-nav"></i>
                                </>
                            ) : (
                                <i className="ri-arrow-left-s-line close-nav"></i>
                            )}
                        </button>
                    </div>
                    <div className="topbar-right">
                        <button
                            className="notification-btn"
                            onClick={() => navigate("/notifications")}
                        >
                            <i className="ri-notification-line"></i>
                            {notifications > 0 && (
                                <span className="notification-badge">{notifications}</span>
                            )}
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                            <i className="ri-logout-box-line"></i>
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <div className="body">{children}</div>
            </div>
        </div>
    );
}

export default Navbar;