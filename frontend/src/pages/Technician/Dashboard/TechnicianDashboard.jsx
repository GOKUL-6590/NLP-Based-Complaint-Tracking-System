import React, { useEffect, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { Calendar } from "react-calendar"; // Install with `npm install react-calendar`
import "react-calendar/dist/Calendar.css";
import "./TechnicianDashboard.css";
import { getApprovedTechnicians } from "../../../service/adminService";
import { getTechnicianStats } from "../../../service/TechnicianService";
import { useDispatch, useSelector } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/alertSlice";

function TechnicianDashboard() {
    const [stats, setStats] = useState({
        totalTickets: 0,
        resolvedToday: 0,
        highPriorityPending: 0,
    });
    const [chartData, setChartData] = useState(null);
    const [assignedToday, setAssignedToday] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [approvedTechnicians, setApprovedTechnicians] = useState([]);
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch()

    // useEffect(() => {
    //     // Fetch dashboard statistics, today's tickets, and dictionary data
    //     const fetchDashboardData = async () => {
    //         try {
    //             const technicianId = localStorage.getItem("technicianId");
    //             // const statsResponse = await axios.get(
    //             //     `http://localhost:5000/dashboard/stats?technician_id=${technicianId}`
    //             // );
    //             // const ticketsResponse = await axios.get(
    //             //     `http://localhost:5000/tickets/assigned-today?technician_id=${technicianId}`
    //             // );
    //             const dictionaryResponse = await getApprovedTechnicians();
    //             console.log(dictionaryResponse.technicians);

    //             if (statsResponse.data.success) {
    //                 setStats(statsResponse.data.stats);
    //                 setChartData(statsResponse.data.chartData);
    //             }

    //             if (ticketsResponse.data.success) {
    //                 setAssignedToday(ticketsResponse.data.tickets);
    //             }

    //             if (dictionaryResponse.success) {
    //                 setApprovedTechnicians(dictionaryResponse.technicians);
    //                 console.log(approvedTechnicians)
    //             }
    //         } catch (error) {
    //             console.error("Failed to fetch dashboard data:", error);
    //         }
    //     };

    //     fetchDashboardData();
    // }, []);

    useEffect(() => {




        if (user?.id) {
            fetchRealTimeStats();
            fetchDashboardData();
        }
    }, [user?.id]); // Added user?.id as a dependency

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
            dispatch(showLoading())
            const response = await getTechnicianStats(user?.id); // Call the function
            dispatch(hideLoading())
            console.log(response);
            if (response.success) {
                setStats(response.stats);
    
                // Transform chartData to the correct format
                const transformedChartData = {
                    labels: response.chartData.map(item => item.status), // Extract the status names
                    datasets: [
                        {
                            label: 'Ticket Status Overview',
                            data: response.chartData.map(item => item.count), // Extract the count for each status
                            backgroundColor: 'rgba(75,192,192,0.2)',
                            borderColor: 'rgba(75,192,192,1)',
                            borderWidth: 1
                        }
                    ]
                };
    
                setChartData(transformedChartData);
            } else {
                console.error("Failed to fetch technician stats:", response.message);
            }
        } catch (error) {
            dispatch(hideLoading())
            console.error("Error fetching technician stats:", error);
        }
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
            <h1>Technician Dashboard</h1>

            {/* First Row: Calendar and Stats */}
            <div className="dashboard-row first-row-tech">
                <div className="calendar-container">
                    <h2>Calendar View</h2>
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        className="react-calendar elegant-calendar"
                    />
                    <p>
                        Selected Date: <strong>{selectedDate.toDateString()}</strong>
                    </p>
                </div>
                <div className="stats-container">
                    <div className="metric-item">
                        <h2>{stats.totalTickets}</h2>
                        <span>Total Assigned Tickets</span>
                    </div>
                    <div className="metric-item">
                        <h2>{stats.resolvedToday}</h2>
                        <span>Tickets Resolved Today</span>
                    </div>
                    <div className="metric-item">
                        <h2>{stats.highPriorityPending}</h2>
                        <span>High Priority Pending</span>
                    </div>
                    <div className="metric-item">
                        <h2>{stats.inProgressTickets}</h2>
                        <span>In Progress Tickets</span>
                    </div>
                </div>
            </div>

            {/* Second Row: Dictionary and Chart */}
            <div className="dashboard-row second-row-tech">
                <div className="dictionary-container">
                    <h2>Technician Dictionary</h2>
                    <div className="technician-cards-container">
                        {approvedTechnicians.length > 0 ? (
                            approvedTechnicians?.map((technician) => (
                                <div key={technician.id} className="technician-card">
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
                    {/* {chartData ? (
                        <Bar data={chartData} options={chartOptions} />
                    ) : (
                        <p>Loading chart...</p>
                    )} */}
                </div>
            </div>
        </div>




    );
}

export default TechnicianDashboard;
