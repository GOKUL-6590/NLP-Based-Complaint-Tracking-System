import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { fetchAdminDashboardData } from "../../../service/adminService";
import { hideLoading, showLoading } from "../../../redux/alertSlice";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [stats, setStats] = useState({
        totalUsers: 0,
        openTickets: 0,
        resolvedTickets: 0,
        pendingTickets: 0,
        chartData: [],
    });
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const getDashboardData = async () => {
            dispatch(showLoading());
            const data = await fetchAdminDashboardData();
            dispatch(hideLoading());
            if (data && data.success) {
                console.log("Fetched data:", data);
                setStats({
                    totalUsers: data.totalUsers,
                    openTickets: data.openTickets,
                    resolvedTickets: data.resolvedTickets,
                    pendingTickets: data.pendingTickets,
                    chartData: data.chartData || [],
                });
            }
            setTimeout(() => setIsInitialLoad(false), 1000);
        };
        getDashboardData();
    }, [dispatch]);

    // Stacked Area Chart options
    const chartOptions = {
        chart: {
            type: "area",
            stacked: true, // Stack areas
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: "easeinout",
                speed: 800,
                animateGradually: { enabled: true, delay: 150 },
            },
        },
        xaxis: {
            categories: stats.chartData.map(item => item.month),
            title: { text: "Month", style: { color: "#333", fontSize: "14px" } },
            labels: { style: { colors: "#666" } },
        },
        yaxis: {
            title: { text: "Number of Tickets", style: { color: "#333", fontSize: "14px" } },
            labels: { style: { colors: "#666" } },
        },
        colors: ["#FF5722", "#4CAF50", "#FFC107"], // Vibrant Orange, Green, Yellow
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2 },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
                stops: [0, 90, 100]
            }
        },
        legend: {
            position: "top",
            horizontalAlign: "center",
            fontSize: "14px",
            markers: { width: 12, height: 12, radius: 12 },
        },
        tooltip: {
            theme: "dark",
            shared: true,
            intersect: false,
        },
    };

    const chartSeries = [
        {
            name: "Open Tickets",
            data: stats.chartData.map(item => item.open_tickets || 0),
        },
        {
            name: "Resolved Tickets",
            data: stats.chartData.map(item => item.resolved_tickets || 0),
        },
        {
            name: "Pending Tickets",
            data: stats.chartData.map(item => item.pending_tickets || 0),
        },
    ];

    return (
        <div className="admin-dashboard">
            <div className={`dashboard-header ${isInitialLoad ? "animate-on-load" : ""}`}>
                <h1>Welcome, {user?.name || "Admin"}</h1>
                <span className="current-date">
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    })}
                </span>
            </div>
            <div className={`dashboard-cards ${isInitialLoad ? "animate-on-load" : ""}`}>
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
            <div className={`dashboard-charts ${isInitialLoad ? "animate-on-load" : ""}`}>
                <h3>Ticket Trends (Last 6 Months)</h3>
                {stats.chartData.length > 0 ? (
                    <>
                        {console.log("Chart Options:", chartOptions)}
                        {console.log("Chart Series:", chartSeries)}
                        <Chart options={chartOptions} series={chartSeries} type="area" height={300} />
                    </>
                ) : (
                    <p>No chart data available</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;