import React from "react";
import { Link } from "react-router-dom";

const TicketTable = ({ tickets, paginate, currentPage, ticketsPerPage, totalTickets }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalTickets / ticketsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="admin-reports-table-wrapper">
            <table className="admin-reports-tickets-table">
                <thead>
                    <tr>
                        <th>Ticket ID</th>
                        <th>System No.</th>
                        <th>Venue</th>
                        <th>Block</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Last Updated</th>
                        <th>User Name</th>
                        <th>Technician Name</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(ticket => (
                        <tr key={ticket.ticket_id}>
                            <td>{ticket.ticket_id}</td>
                            <td>{ticket.system_number}</td>
                            <td>{ticket.venue}</td>
                            <td>{ticket.block}</td>
                            <td>{ticket.category}</td>
                            <td>{ticket.priority}</td>
                            <td>{ticket.status}</td>
                            <td>{ticket.created_at}</td>
                            <td>{ticket.last_updated}</td>
                            <td>{ticket.user_name || "N/A"}</td>
                            <td>{ticket.technician_name || "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Card View for Mobile */}
            {tickets.length > 0 ? (
                tickets.map(ticket => (
                    <div className="admin-reports-card" key={ticket.ticket_id}>
                        <div><strong>Ticket ID:</strong> {ticket.ticket_id}</div>
                        <div><strong>System No.:</strong> {ticket.system_number}</div>
                        <div><strong>Venue:</strong> {ticket.venue}</div>
                        <div><strong>Block:</strong> {ticket.block}</div>
                        <div><strong>Category:</strong> {ticket.category}</div>
                        <div><strong>Priority:</strong> {ticket.priority}</div>
                        <div><strong>Status:</strong> <span className={`admin-reports-status-${ticket.status.toLowerCase()}`}>{ticket.status}</span></div>
                        <div><strong>Created At:</strong> {ticket.created_at}</div>
                        <div><strong>Last Updated:</strong> {ticket.last_updated}</div>
                        <div><strong>Emergency:</strong> {ticket.is_emergency ? "Yes" : "No"}</div>
                        <div><strong>User Name:</strong> {ticket.user_name || "N/A"}</div>
                        <div><strong>Technician Name:</strong> {ticket.technician_name || "N/A"}</div>
                        <div><Link to={`/ticket/${ticket.ticket_id}`} className="admin-reports-view-ticket">View</Link></div>
                    </div>
                ))
            ) : (
                <div className="admin-reports-card">
                    <div style={{ textAlign: "center" }}>No tickets found</div>
                </div>
            )}


            {/* Pagination */}
            <div className="pagination">
                {pageNumbers.map(number => (
                    <button key={number} onClick={() => paginate(number)}>
                        {number}
                    </button>
                ))}
            </div>
        </div >
    );
};

export default TicketTable;
