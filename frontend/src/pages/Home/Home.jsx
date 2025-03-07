import React, { useState, useEffect } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { disputeTicket, getDashboardStats } from "../../service/userService";
import socket from "../../components/socket";
import toast from "react-hot-toast";
import TicketModal from "../../components/EditTicket/EditTicket";
import { hideLoading, showLoading } from "../../redux/alertSlice";

const TIMER_DURATION = 300; // 5 minutes in seconds
const IST_OFFSET = 19800; // 5.5 hours in seconds (UTC+5:30 to UTC)

const Home = () => {
    const [activeTickets, setActiveTickets] = useState([]);
    const [ticketStats, setTicketStats] = useState({
        openedToday: 0,
        activeTickets: 0,
        closedTickets: 0,
        overallClosed: 0,
    });
    const [timers, setTimers] = useState({}); // { ticket_id: { timeLeft, endTime } }
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchDashboardData = async () => {
            try {
                dispatch(showLoading());
                const data = await getDashboardStats(user.id);
                dispatch(hideLoading());
                if (data.success) {
                    setTicketStats({
                        openedToday: data.dashboard_data.opened_today,
                        activeTickets: data.dashboard_data.active_tickets,
                        closedTickets: data.dashboard_data.closed_tickets,
                        overallClosed: data.dashboard_data.total_tickets,
                    });
                    setActiveTickets(data.dashboard_data.active_tickets_list || []);
                }
            } catch (error) {
                dispatch(hideLoading());
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchDashboardData();
        socket.emit("join", user.id);

        const handleInProgressUpdate = (data) => {
            console.log("Received inprogress-update:", data);
            if (data.user_id === user.id) {
                setTicketStats({
                    openedToday: data.metrics.opened_today,
                    activeTickets: data.metrics.active_tickets,
                    closedTickets: data.metrics.closed_tickets,
                    overallClosed: data.metrics.total_tickets,
                });
                setActiveTickets(data.tickets);
            }
        };

        socket.on("inprogress-update", handleInProgressUpdate);
        return () => {
            socket.off("inprogress-update", handleInProgressUpdate);
        };
    }, [user?.id, dispatch]);

    // Initialize timers when activeTickets change
    useEffect(() => {
        const newTimers = {};
        activeTickets.forEach((ticket) => {
            if (ticket.status.toLowerCase() === "in progress" && ticket.last_updated) {
                const { timeLeft, endTime } = getTimeLeftAndEndTime(ticket.last_updated);
                newTimers[ticket.ticket_id] = { timeLeft, endTime };
            }
        });
        setTimers(newTimers);
    }, [activeTickets]);

    // Update timers every second
    useEffect(() => {
        const interval = setInterval(() => {
            setTimers((prevTimers) => {
                const updatedTimers = { ...prevTimers };
                Object.keys(updatedTimers).forEach((ticketId) => {
                    const { endTime } = updatedTimers[ticketId];
                    const currentTime = Math.floor(Date.now() / 1000);
                    const timeLeft = Math.max(0, endTime - currentTime);
                    updatedTimers[ticketId].timeLeft = timeLeft;
                });
                return updatedTimers;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const getTimeLeftAndEndTime = (lastUpdated) => {
        if (!lastUpdated) return { timeLeft: 0, endTime: 0 };

        let startTime;
        // Parse last_updated as UTC
        if (lastUpdated.includes("GMT")) {
            // "Fri, 07 Mar 2025 10:52:49 GMT"
            startTime = new Date(lastUpdated).getTime() / 1000;
        } else if (lastUpdated.includes("T") && lastUpdated.includes("+")) {
            // "2025-03-07T10:52:49+00:00"
            startTime = new Date(lastUpdated).getTime() / 1000;
        } else if (lastUpdated.includes("/")) {
            // "3/7/2025, 10:52:49 AM" - Treat as UTC
            const [datePart, timePart] = lastUpdated.split(", ");
            const [month, day, year] = datePart.split("/").map(Number);
            const [time, period] = timePart.split(" ");
            let [hours, minutes, seconds] = time.split(":").map(Number);
            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;
            startTime = Date.UTC(year, month - 1, day, hours, minutes, seconds) / 1000;
        } else if (lastUpdated.includes(" ")) {
            // "2025-03-07 10:52:49"
            const utcLastUpdated = lastUpdated.replace(" ", "T") + "Z";
            startTime = new Date(utcLastUpdated).getTime() / 1000;
        } else {
            console.error("Unrecognized last_updated format:", lastUpdated);
            return { timeLeft: 0, endTime: 0 };
        }

        if (isNaN(startTime)) {
            console.error("Invalid date parsed from lastUpdated:", lastUpdated);
            return { timeLeft: 0, endTime: 0 };
        }
        startTime = startTime - IST_OFFSET

        const endTime = startTime + TIMER_DURATION; // 5 minutes from start
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = Math.max(0, endTime - currentTime);

        console.log("startTime:", startTime, "endTime:", endTime, "currentTime:", currentTime, "timeLeft:", timeLeft);
        return { timeLeft, endTime };
    };

    const handleDispute = async (ticket_id) => {
        try {
            const response = await disputeTicket(ticket_id);
            if (response.success) {
                toast.success(response.message);
                socket.emit("inprogress-update", user.id);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Error in Disputing ticket");
        }
    };

    const handleRowClick = (ticket) => {
        setSelectedTicket(ticket);
    };

    const handleCloseModal = () => {
        setSelectedTicket(null);
    };

    return (
        <div className="home-content-wrapper">
            <div className="dashboard-header">
                <h1>Welcome, {user?.name || "Technician"}</h1>
                <span className="current-date">{new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })}</span>
            </div>
            <div className="dashboard-actions">
                <h2>Dashboard</h2>
                <button className="create-ticket-btn" onClick={() => navigate("/new-ticket")}>
                    <span className="plus-icon">+</span> New Ticket
                </button>
            </div>
            <div className="dashboard-stats">
                <div className="stat-card"><h3>Tickets Opened Today</h3><p>{ticketStats.openedToday}</p></div>
                <div className="stat-card"><h3>Active Tickets</h3><p>{ticketStats.activeTickets}</p></div>
                <div className="stat-card"><h3>Total Tickets Closed</h3><p>{ticketStats.closedTickets}</p></div>
                <div className="stat-card"><h3>Overall Tickets</h3><p>{ticketStats.overallClosed}</p></div>
            </div>
            <div className="active-tickets">
                <h2>Active Tickets</h2>
                {activeTickets.length === 0 ? (
                    <p>No active tickets. You're all caught up!</p>
                ) : (
                    <table className="tickets-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Last Updated</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTickets.map((ticket) => {
                                const timer = ticket.status.toLowerCase() === "in progress" && timers[ticket.ticket_id]
                                    ? timers[ticket.ticket_id]
                                    : { timeLeft: 0 };
                                const timeLeft = timer.timeLeft;
                                const isDisputeDisabled = timeLeft === 0 || ticket.status.toLowerCase() !== "in progress";
                                return (
                                    <tr key={ticket.ticket_id} onClick={() => handleRowClick(ticket)}>
                                        <td>{ticket.ticket_id}</td>
                                        <td>{ticket.description}</td>
                                        <td>{ticket.status}</td>
                                        <td>{ticket.priority}</td>
                                        <td>{new Date(ticket.last_updated).toLocaleString("en-US", { timeZone: "UTC" })}</td>
                                        <td>
                                            {ticket.status.toLowerCase() === "in progress" && (
                                                <>
                                                    <p>
                                                        Time left: {Math.floor(timeLeft / 60)}:
                                                        {String(timeLeft % 60).padStart(2, "0")}
                                                    </p>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDispute(ticket.ticket_id); }}
                                                        className="dispute-button"
                                                        disabled={isDisputeDisabled}
                                                    >
                                                        Dispute Change
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            {selectedTicket && <TicketModal ticket={selectedTicket} onClose={handleCloseModal} />}
        </div>
    );
};

export default Home;