import React from "react";
import { CheckCircle, Hourglass, UserCheck, ClipboardList } from "lucide-react";
import "./TicketDetailsModal.css"; // Ensure the CSS file is updated

const TicketDetailsModal = ({ ticket, onClose }) => {
    if (!ticket) return null;

    // Function to determine progress width and active step
    const getStatusProgress = (status) => {
        switch (status.toLowerCase()) {
            case "open":
                return 0;
            case "assigned":
                return 33;
            case "in progress":
                return 66;
            case "closed":
                return 100;
            default:
                return 0;
        }
    };

    return (
        <div className="ticket-details-modal">
            <div className="ticket-details-content">
                {/* Close Button */}
                <button className="close-button" onClick={onClose}>X</button>

                {/* Header */}
                <div className="modal-header">
                    <h3>Ticket Details</h3>
                    <p className="ticket-id">Ticket ID: {ticket.ticket_id}</p>
                </div>

                {/* Grid Layout for Details */}
                <div className="modal-grid">
                    <div className="modal-section">
                        <h4>Ticket Information</h4>
                        <div className="detail-item"><strong>Category:</strong> {ticket.category}</div>
                        <div className="detail-item"><strong>Description:</strong> {ticket.description}</div>
                        <div className="detail-item"><strong>Priority:</strong> {ticket.priority}</div>
                    </div>

                    <div className="modal-section">
                        <h4>Technician Details</h4>
                        <div className="detail-item"><strong>Technician:</strong> {ticket.technician_name || "--"}</div>
                        <div className="detail-item"><strong>Assigned On:</strong> {new Date(ticket.started_time).toLocaleString()}</div>
                    </div>

                    <div className="modal-section">
                        <h4>Timeline</h4>
                        <div className="detail-item"><strong>Started Time:</strong> {new Date(ticket.started_time).toLocaleString()}</div>
                        <div className="detail-item"><strong>Last Updated:</strong> {new Date(ticket.last_updated).toLocaleString()}</div>
                        <div className="detail-item"><strong>SLA Deadline:</strong> {new Date(ticket.sla_deadline).toLocaleString()}</div>
                    </div>

                    {/* Status Progress Bar with Icons */}
                    <div className="modal-section">
                        <h4>Status Progress</h4>
                        <div className="progress-container">
                            <div className="progress-line"></div>
                            <div className="progress-fill" style={{ width: `${getStatusProgress(ticket.status)}%` }}></div>

                            <div className={`progress-step ${ticket.status.toLowerCase() === "open" ? "active" : ""}`}>
                                <ClipboardList size={20} />
                            </div>
                            <div className={`progress-step ${ticket.status.toLowerCase() === "assigned" ? "active" : ""}`}>
                                <UserCheck size={20} />
                            </div>
                            <div className={`progress-step ${ticket.status.toLowerCase() === "in progress" ? "active" : ""}`}>
                                <Hourglass size={20} />
                            </div>
                            <div className={`progress-step ${ticket.status.toLowerCase() === "closed" ? "active" : ""}`}>
                                <CheckCircle size={20} />
                            </div>
                        </div>
                        <p className="progress-text">
                            {ticket.status === "Open" ? "Ticket is open and awaiting assignment."
                                : ticket.status === "Assigned" ? "Ticket has been assigned to a technician."
                                    : ticket.status === "InProgress" ? "Ticket is in progress."
                                        : "Ticket has been resolved or closed."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailsModal;
