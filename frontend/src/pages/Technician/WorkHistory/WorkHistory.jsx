import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./WorkHistory.css"; // Ensure you create a matching CSS file
import { FaTimesCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getAssignedTicketsForTechnician } from "../../../service/TechnicianService"; // API call function
import { hideLoading, showLoading } from "../../../redux/alertSlice";

const WorkHistory = () => {
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("All");
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.user); // Get logged-in technician

    useEffect(() => {
        fetchAssignedTickets();
    }, []);

    const fetchAssignedTickets = async () => {
        try {
            dispatch(showLoading())
            const response = await getAssignedTicketsForTechnician(user.id);
            dispatch(hideLoading())
            console.log("API Response:", response);

            if (response.success) {
                setTickets(response.tickets);
            } else {
                setTickets([]);
            }
        } catch (err) {
            dispatch(hideLoading())
            setError("Failed to fetch assigned tickets.");
        }
    };

    // Filter tickets based on selected status
    const filteredTickets =
        filterStatus === "All"
            ? tickets
            : tickets.filter(ticket => ticket.status.toLowerCase() === filterStatus.toLowerCase());

    return (
        <div className="work-history-container">
            <h2>Work History</h2>

            {/* Filter Dropdown */}
            <div className="filter-container">
                <label htmlFor="status-filter">Filter by Status:</label>
                <select
                    id="status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="All">All</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                </select>
            </div>

            {/* Table Wrapper */}
            <div className="table-wrapper">
                <table className="work-table">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Venue</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-tickets">
                                    <div className="table-cell-content">
                                        <FaTimesCircle className="no-tickets-icon" />
                                        <span>No assigned tickets</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <tr key={ticket.ticket_id}>
                                    <td>{ticket.ticket_id}</td>
                                    <td>{ticket.description}</td>
                                    <td>{ticket.category}</td>
                                    <td>{ticket.priority}</td>
                                    <td>{ticket.venue}</td>
                                    <td className={`status-${ticket.status.toLowerCase()}`}>{ticket.status}</td>
                                    <td>{new Date(ticket.created_at).toLocaleString()}</td>
                                    <td>
                                        <Link to={`/ticket/${ticket.ticket_id}`} className="view-ticket">View</Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkHistory;
