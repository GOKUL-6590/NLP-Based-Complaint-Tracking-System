import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import "./TechnicianDashboard.css";
import { getApprovedTechnicians } from "../../../service/adminService";
import { getTechnicianStats } from "../../../service/TechnicianService";
import { useDispatch, useSelector } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/alertSlice";
import { FaClock } from "react-icons/fa";
import TechnicianModal from "../../../components/TechnicianCard/TechnicianCard";

function TechnicianDashboard() {
    const [stats, setStats] = useState({
        totalTickets: 0,
        resolvedToday: 0,
        highPriorityPending: 0,
        inProgressTickets: 0,
    });
    const [chartData, setChartData] = useState(null);
    const [approvedTechnicians, setApprovedTechnicians] = useState([]);
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [isTechModalOpen, setIsTechModalOpen] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState(null);

    useEffect(() => {
        if (user?.id) {
            fetchRealTimeStats();
            fetchDashboardData();
        }
    }, [user?.id]);

    const fetchDashboardData = async () => {
        try {
            const dictionaryResponse = await getApprovedTechnicians();
            if (dictionaryResponse.success) {
                console.log("Technicians fetched:", dictionaryResponse.technicians);
                setApprovedTechnicians(dictionaryResponse.technicians);
            } else {
                console.error("Failed to fetch technicians:", dictionaryResponse.message);
            }
        } catch (error) {
            console.error("Error fetching technicians:", error);
        }
    };

    const fetchRealTimeStats = async () => {
        try {
            dispatch(showLoading());
            const response = await getTechnicianStats(user?.id);
            dispatch(hideLoading());
            console.log(response);
            if (response.success) {
                setStats(response.stats);
                const transformedChartData = {
                    labels: response.chartData.map(item => item.status),
                    datasets: [
                        {
                            label: "Ticket Status Overview",
                            data: response.chartData.map(item => item.count),
                            backgroundColor: "rgba(75,192,192,0.2)",
                            borderColor: "rgba(75,192,192,1)",
                            borderWidth: 1,
                        },
                    ],
                };
                setChartData(transformedChartData);
            } else {
                console.error("Failed to fetch technician stats:", response.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.error("Error fetching technician stats:", error);
        }
    };

    const openTechModal = (technician) => {
        setSelectedTechnician(technician);
        setIsTechModalOpen(true);
    };

    const closeTechModal = () => {
        setSelectedTechnician(null);
        setIsTechModalOpen(false);
    };

    const getInitials = (name) => {
        const words = name.split(" ");
        return words.length > 1
            ? `${words[0][0]}${words[1][0]}`
            : words[0].slice(0, 2).toUpperCase();
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: "Ticket Status Overview" },
        },
    };

    return (
        <div className="technician-dashboard">
            <div className="dashboard-header">
                <h1>Welcome, {user?.name || "Technician"}</h1>
                <span className="current-date">{new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })}</span>
            </div>

            <div className="dashboard-row first-row-tech">
                <div className="stats-container">
                    <div className="metric-item">
                        <h2>{stats.totalTickets}</h2>
                        <span>Total Assigned</span>
                    </div>
                    <div className="metric-item">
                        <h2>{stats.resolvedToday}</h2>
                        <span>Resolved Today</span>
                    </div>
                    <div className="metric-item">
                        <h2>{stats.highPriorityPending}</h2>
                        <span>High Priority</span>
                    </div>
                    <div className="metric-item">
                        <h2>{stats.inProgressTickets}</h2>
                        <span>In Progress</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-row second-row-tech">
                <div className="dictionary-container">
                    <h2>Technician Dictionary</h2>
                    <div className="technician-cards-container">
                        {approvedTechnicians.length > 0 ? (
                            approvedTechnicians.map((technician) => (
                                <div
                                    key={technician.id}
                                    className="technician-card"
                                    onClick={() => openTechModal(technician)}
                                >
                                    <div className="profile-placeholder">
                                        {technician.profile_picture ? (
                                            <img
                                                src={technician.profile_picture}
                                                alt={technician.name}
                                                className="profile-pic"
                                            />
                                        ) : (
                                            <span>{getInitials(technician.name)}</span>
                                        )}
                                    </div>
                                    <FaClock className="clock-icon" />
                                    <div className="technician-name">{technician.name}</div>
                                    <div className="technician-role">{technician.role}</div>
                                </div>
                            ))
                        ) : (
                            <p>No approved technicians yet</p>
                        )}
                    </div>
                </div>
                <div className="chart-container">
                    <h2>Ticket Status Overview</h2>
                    {chartData ? (
                        <Bar data={chartData} options={chartOptions} />
                    ) : (
                        <p>Loading chart...</p>
                    )}
                </div>
            </div>

            {isTechModalOpen && (
                <TechnicianModal technician={selectedTechnician} onClose={closeTechModal} />
            )}
        </div>
    );
}

export default TechnicianDashboard;