import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./TicketHistory.css";
import { FaTimesCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getTicketHistoryByUser } from "../../service/userService";
import { hideLoading, showLoading } from "../../redux/alertSlice";

const TicketHistory = () => {
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("All");
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch()
    const [currentPage, setCurrentPage] = useState(1);
    const ticketsPerPage = 5;

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            dispatch(showLoading())
            const response = await getTicketHistoryByUser(user.id);
            dispatch(hideLoading())

            if (response.success) {
                setTickets(response.tickets);
            } else {
                setTickets([]);
            }
        } catch (err) {
            dispatch(hideLoading())
            setError("Failed to fetch ticket history.");
        }
    };

    // Filter tickets based on status
    const filteredTickets =
        filterStatus === "All"
            ? tickets
            : tickets.filter(ticket => ticket.status.toLowerCase() === filterStatus.toLowerCase());

    // Get current tickets
    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="ticket-history-container">
            <h2>Ticket History</h2>

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
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                </select>
            </div>

            {/* Table Wrapper with Fixed Height */}
            <div className="table-wrapper">
                <table className="ticket-table">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Block</th>
                            <th>Venue</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTickets.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="no-tickets">
                                    <div className="table-cell-content">
                                        <FaTimesCircle className="no-tickets-icon" />
                                        <span>No tickets available</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            currentTickets.map((ticket) => (
                                <tr key={ticket.ticket_id}>
                                    <td data-label="Ticket ID"><div className="table-cell-content">{ticket.ticket_id}</div></td>
                                    <td data-label="Description"><div className="table-cell-content">{ticket.description}</div></td>
                                    <td data-label="Category"><div className="table-cell-content">{ticket.category}</div></td>
                                    <td data-label="Priority"><div className="table-cell-content">{ticket.priority}</div></td>
                                    <td data-label="Block"><div className="table-cell-content">{ticket.block}</div></td>
                                    <td data-label="Venue"><div className="table-cell-content">{ticket.venue}</div></td>
                                    <td data-label="Status" className={`status-${ticket.status.toLowerCase()}`}>
                                        <div className="table-cell-content">{ticket.status}</div>
                                    </td>
                                    <td data-label="Created At"><div className="table-cell-content">{new Date(ticket.created_at).toLocaleString()}</div></td>
                                    <td data-label="Action">
                                        <div className="table-cell-content">
                                            <Link to={`/ticket/${ticket.ticket_id}`} className="view-ticket">View</Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={indexOfLastTicket >= filteredTickets.length}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default TicketHistory;
