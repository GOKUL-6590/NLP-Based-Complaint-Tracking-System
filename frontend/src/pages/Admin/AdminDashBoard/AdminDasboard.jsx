import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { fetchAdminDashboardData } from "../../../service/adminService"; // Import service

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user); // Get user info from Redux

    const [stats, setStats] = useState({
        totalUsers: 0,
        openTickets: 0,
        resolvedTickets: 0,
        pendingTickets: 0,
    });

    useEffect(() => {
        const getDashboardData = async () => {
            const data = await fetchAdminDashboardData();
            if (data) {
                setStats(data);
            }
        };
        getDashboardData();
    }, []);

    const chartOptions = {
        chart: { type: "line", toolbar: { show: false } },
        xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
        colors: ["#4CAF50", "#FF5722"],
        dataLabels: { enabled: false },
    };

    const chartSeries = [
        { name: "Tickets Raised", data: [10, 40, 35, 50, 49, 60] },
        { name: "Tickets Resolved", data: [5, 20, 25, 40, 35, 50] },
    ];

    return (
        <div className="admin-dashboard">
            <h2>Welcome, {user?.name}</h2>
            <div className="dashboard-cards">
                <div className="card">
                    <h3>Total Users</h3>
                    <p>{stats.totalUsers}</p>
                </div>
                <div className="card">
                    <h3>Open Tickets</h3>
                    <p>{stats.openTickets}</p>
                </div>
                <div className="card">
                    <h3>Resolved Tickets</h3>
                    <p>{stats.resolvedTickets}</p>
                </div>
                <div className="card">
                    <h3>Pending Tickets</h3>
                    <p>{stats.pendingTickets}</p>
                </div>
            </div>
            <div className="dashboard-charts">
                <h3>Ticket Trends</h3>
                <Chart options={chartOptions} series={chartSeries} type="line" height={300} />
            </div>
            <div className="dashboard-links">
                <button onClick={() => navigate("/admin/users")}>Manage Users</button>
                <button onClick={() => navigate("/admin/tickets")}>Manage Tickets</button>
                <button onClick={() => navigate("/admin/reports")}>View Reports</button>
                <button onClick={() => navigate("/admin/settings")}>Settings</button>
            </div>
        </div>
    );
};

export default AdminDashboard;
