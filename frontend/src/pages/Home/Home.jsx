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

const Home = () => {
    const [activeTickets, setActiveTickets] = useState([]);
    const [ticketStats, setTicketStats] = useState({
        openedToday: 0,
        activeTickets: 0,
        closedTickets: 0,
        overallClosed: 0,
    });
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.user);
    const [timerData, setTimerData] = useState(() => JSON.parse(localStorage.getItem("timerData")) || {});
    const [selectedTicket, setSelectedTicket] = useState(null); // State for the selected ticket

    useEffect(() => {
        if (!user?.id) return;

        const fetchDashboardData = async () => {
            try {
                dispatch(showLoading())
                const data = await getDashboardStats(user.id);
                dispatch(hideLoading())
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
                dispatch(hideLoading())
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchDashboardData();
        socket.emit("join", user.id);

        const handleInProgressUpdate = (data) => {
            setTicketStats({
                openedToday: data.metrics.opened_today,
                activeTickets: data.metrics.active_tickets,
                closedTickets: data.metrics.closed_tickets,
                overallClosed: data.metrics.total_tickets,
            });
            setActiveTickets(data.tickets);
        };

        socket.on("inprogress-update", handleInProgressUpdate);
        return () => {
            socket.off("inprogress-update", handleInProgressUpdate);
        };
    }, [user?.id]);

    // useEffect(() => {
    //     if (!activeTickets.length) return;

    //     const currentTime = Math.floor(Date.now() / 1000);
    //     const updatedTimers = { ...timerData };

    //     activeTickets.forEach((ticket) => {
    //         if (ticket.status.toLowerCase() === "in progress") {
    //             const localStorageKey = `ticket_${ticket.ticket_id}_startTime`;
    //             let storedStartTime = localStorage.getItem(localStorageKey);

    //             if (!storedStartTime) {
    //                 localStorage.setItem(localStorageKey, currentTime);
    //                 storedStartTime = currentTime;
    //             } else {
    //                 storedStartTime = parseInt(storedStartTime, 10);
    //             }

    //             const elapsedTime = currentTime - storedStartTime;
    //             const remainingTime = Math.max(0, TIMER_DURATION - elapsedTime);

    //             updatedTimers[ticket.ticket_id] = {
    //                 timeLeft: remainingTime,
    //                 isDisabled: remainingTime === 0,
    //             };
    //         }
    //     });

    //     setTimerData(updatedTimers);
    // }, [activeTickets]);

    useEffect(() => {
        if (!activeTickets.length) return;

        const currentTime = Math.floor(Date.now() / 1000);
        const updatedTimers = { ...timerData };

        activeTickets.forEach((ticket) => {
            if (ticket.status.toLowerCase() === "in progress") {
                const localStorageKey = `ticket_${ticket.ticket_id}_startTime`;
                const expirationKey = `expired_ticket_${ticket.ticket_id}`;

                // 🚨 Check if the ticket has already expired
                if (localStorage.getItem(expirationKey)) {
                    console.log(`Ticket ${ticket.ticket_id} already expired, skipping...`);
                    return; // Don't reset the timer
                }

                let storedStartTime = localStorage.getItem(localStorageKey);

                if (!storedStartTime) {
                    // If no start time exists, set it now
                    localStorage.setItem(localStorageKey, currentTime);
                    storedStartTime = currentTime;
                } else {
                    storedStartTime = parseInt(storedStartTime, 10);
                }

                const elapsedTime = currentTime - storedStartTime;
                const remainingTime = Math.max(0, TIMER_DURATION - elapsedTime);

                if (remainingTime === 0) {
                    // 🛑 When timer expires, set expiration flag & remove start time
                    localStorage.setItem(expirationKey, "true"); // Mark as expired
                    localStorage.removeItem(localStorageKey);
                    delete updatedTimers[ticket.ticket_id]; // Remove from state
                } else {
                    updatedTimers[ticket.ticket_id] = {
                        timeLeft: remainingTime,
                        isDisabled: remainingTime === 0,
                    };
                }
            }
        });

        setTimerData(updatedTimers);
    }, [activeTickets]);

    // useEffect(() => {
    //     if (!Object.keys(timerData).length) return;

    //     const interval = setInterval(() => {
    //         setTimerData((prevData) => {
    //             const updatedData = {};
    //             const currentTime = Math.floor(Date.now() / 1000);

    //             Object.keys(prevData).forEach((ticketId) => {
    //                 let storedStartTime = localStorage.getItem(`ticket_${ticketId}_startTime`);
    //                 if (!storedStartTime) return;

    //                 storedStartTime = parseInt(storedStartTime, 10);
    //                 const elapsedTime = currentTime - storedStartTime;
    //                 let newTimeLeft = Math.max(0, TIMER_DURATION - elapsedTime);

    //                 updatedData[ticketId] = {
    //                     timeLeft: newTimeLeft,
    //                     isDisabled: newTimeLeft === 0,
    //                 };
    //             });

    //             return updatedData;
    //         });
    //     }, 1000);

    //     return () => clearInterval(interval);
    // }, [timerData]);

    useEffect(() => {
        if (!Object.keys(timerData).length) return;

        const interval = setInterval(() => {
            setTimerData((prevData) => {
                const updatedData = {};
                const currentTime = Math.floor(Date.now() / 1000);

                Object.keys(prevData).forEach((ticketId) => {
                    let storedStartTime = localStorage.getItem(`ticket_${ticketId}_startTime`);
                    if (!storedStartTime) return;

                    storedStartTime = parseInt(storedStartTime, 10);
                    const elapsedTime = currentTime - storedStartTime;
                    let newTimeLeft = Math.max(0, TIMER_DURATION - elapsedTime);

                    updatedData[ticketId] = {
                        timeLeft: newTimeLeft,
                        isDisabled: newTimeLeft === 0, // ✅ Ensuring disabled state
                    };

                    // ✅ Remove timer from storage once it expires
                    if (newTimeLeft === 0) {
                        localStorage.setItem(`expired_ticket_${ticketId}`, "true");
                        localStorage.removeItem(`ticket_${ticketId}_startTime`);
                    }
                });

                return updatedData;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timerData]);


    useEffect(() => {
        localStorage.setItem("timerData", JSON.stringify(timerData));
    }, [timerData]);

    const handleDispute = async (ticket_id) => {
        try {
            const response = await disputeTicket(ticket_id);
            if (response.success) {
                toast.success(response.message);
                window.location.reload()
                localStorage.removeItem(`ticket_${ticket_id}_startTime`);
            } else {
                toast.error(response.message);

            }

        } catch (error) {

            toast.error("Error in Disputing ticket")

        }

    }
    const handleRowClick = (ticket) => {
        setSelectedTicket(ticket); // Set selected ticket on click
    };

    const handleCloseModal = () => {
        setSelectedTicket(null); // Close modal
    };

    return (
        <div className="home-content-wrapper">
            <div className="dashboard-header">
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
                            </tr>
                        </thead>
                        <tbody>
                            {activeTickets.map((ticket) => (
                                <tr key={ticket.ticket_id} onClick={() => handleRowClick(ticket)} className="ticket-row">
                                    <td>{ticket.ticket_id}</td>
                                    <td>{ticket.description}</td>
                                    <td>{ticket.status}</td>
                                    <td>{ticket.priority}</td>
                                    <td>{new Date(ticket.last_updated).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedTicket && <TicketModal ticket={selectedTicket} onClose={handleCloseModal} />}
        </div>
    );
};

export default Home;
