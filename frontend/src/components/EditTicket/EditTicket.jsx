import React, { useState, useEffect } from "react";
import { CheckCircle, Hourglass, UserCheck, ClipboardList } from "lucide-react";
import "./EditTicket.css";
import { FaTimesCircle } from "react-icons/fa";
import { closeTicket, getRequestedSpares, updateTicketStatus } from "../../service/TechnicianService";
import socket from "../socket"; // Your WebSocket singleton
import { useSelector } from "react-redux";
import RequestSparesModal from "../RequestSpares/RequestSpares";
import toast from "react-hot-toast";
import { updateTicketPriority } from "../../service/adminService";

const TicketModal = ({ ticket, onClose, onStatusUpdate, onCloseTicket, onRequestSpares, onDispute }) => {
    if (!ticket) return null;

    const [closureLog, setClosureLog] = useState("");
    const [openSpares, setOpenSpares] = useState(null); // Fixed null initialization
    const [spares, setSpares] = useState([]);
    const [status, setStatus] = useState(ticket.status);
    const [priority, setPriority] = useState(ticket.priority);
    const [timer, setTimer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isDisputed, setIsDisputed] = useState(false);
    const { user } = useSelector((state) => state.user);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);

    const getStatusProgress = (status) => {
        switch (status.toLowerCase().replace(/\s+/g, "")) {
            case "open": return 0;
            case "assigned": return 33;
            case "inprogress": return 66;
            case "closed": return 100;
            default: return 0;
        }
    };

    const isTechnician = user.role === "technician";
    const isAdmin = user.role === "admin";

    // Handle Closure Log Change
    const handleClosureLogChange = (e) => {
        setClosureLog(e.target.value);
    };

    // Handle Status Update to "In Progress"
    const handleStatusUpdate = async (newStatus) => {
        try {
            if (newStatus.toLowerCase() === "inprogress") {
                const response = await updateTicketStatus(ticket.ticket_id, "In Progress", user.id, ticket.user_id);
                if (response.success) {
                    setStatus("In Progress");
                    onStatusUpdate(ticket.ticket_id, "In Progress"); // Update parent component
                    // Emit WebSocket events
                    socket.emit("inprogress-update", ticket.user_id);
                    socket.emit("unread-notifications", ticket.user_id);
                    socket.emit("technician-work-history", ticket.technician_id);     // For WorkHistory
                    socket.emit("ticket-assigned", ticket.ticket_id); // Notify ticket assignment changes
                    socket.emit("technician-work-history", ticket.technician_id);     // For WorkHistory
                    socket.emit("user-ticket-history", ticket.user_id);              // For TicketHistory
                    toast.success("Ticket updated to In Progress");
                } else {
                    toast.error(response.message);
                }
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    // Handle Close Ticket
    const handleCloseTicketClick = () => {
        setIsClosureModalOpen(true);
    };

    const handleCloseTicketSubmit = async () => {
        if (closureLog.trim() === "") {
            toast.error("Please provide a closure log.");
            return;
        }
        try {
            const response = await closeTicket(ticket.ticket_id, "Closed", closureLog, user.id, ticket.id);
            if (response.success) {
                setStatus("Closed");
                onCloseTicket(ticket.ticket_id, closureLog);
                setIsClosureModalOpen(false);
                setClosureLog("");
                toast.success(response.message);
                // Emit WebSocket events
                socket.emit("technician-work-history", ticket.technician_id);     // For WorkHistory
                socket.emit("inprogress-update", ticket.user_id); // Update ticket stats
                socket.emit("unread-notifications", ticket.user_id);
                socket.emit("ticket-assigned", ticket.ticket_id); // Update ticket lists
                socket.emit("inprogress-update", ticket.user_id);         // For Home page
                socket.emit("user-ticket-history", ticket.user_id);              // For TicketHistory
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error closing ticket:", error);
            toast.error("Failed to close ticket");
        }
    };

    // Handle Priority Update (Admin)
    const handlePriorityUpdate = async () => {
        try {
            const response = await updateTicketPriority(ticket.ticket_id, priority, ticket.user_id, ticket.technician_id);
            if (response.success) {
                toast.success("Priority updated successfully");
                // Emit WebSocket events
                socket.emit("technician-assigned-tickets", ticket.technician_id); // New event
                socket.emit("technician-work-history", ticket.technician_id);     // For WorkHistory
                socket.emit("unread-notifications", ticket.user_id); // Notify user
                socket.emit("ticket-assigned", ticket.ticket_id); // Update ticket lists
                socket.emit("inprogress-update", ticket.id);         // For Home page
                socket.emit("user-ticket-history", ticket.user_id);              // For TicketHistory
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error updating priority:", error);
            toast.error("Failed to update priority");
        }
    };

    // Fetch Spares and Set Up WebSocket Listeners
    useEffect(() => {
        console.log(ticket)
        socket.emit("join", user.id)
        const fetchSpares = async () => {
            const response = await getRequestedSpares(ticket.ticket_id);
            setSpares(response.requested_spares || []);
        };

        if (ticket.ticket_id) {
            fetchSpares();
        }

        // WebSocket listeners
        socket.on("inprogress-update", (data) => {
            if (data.user_id === ticket.user_id && data.tickets) {
                const updatedTicket = data.tickets.find(t => t.ticket_id === ticket.ticket_id);
                if (updatedTicket) {
                    setStatus(updatedTicket.status);
                }
            }
        });

        socket.on("ticket-assigned", (data) => {
            const updatedTicket = [...data.assigned, ...data.unassigned].find(t => t.ticket_id === ticket.ticket_id);
            if (updatedTicket) {
                setStatus(updatedTicket.status);
                setPriority(updatedTicket.priority);
            }
        });

        return () => {
            socket.off("inprogress-update");
            socket.off("ticket-assigned");
        };
    }, [ticket.ticket_id, ticket.user_id]);

    return (
        <div className="ticket-modal">
            <div className="ticket-modal-content">
                <button className="close-button" onClick={onClose}>X</button>
                <div className="modal-header">
                    <h3>Ticket Details</h3>
                    <p className="ticket-id">Ticket ID: {ticket.ticket_id}</p>
                </div>
                <div className="modal-grid">
                    <div className="modal-section">
                        <h4>Ticket Information</h4>
                        <div className="detail-item"><strong>System Number:</strong> {ticket.system_number}</div>
                        <div className="detail-item"><strong>Venue:</strong> {ticket.venue}, {ticket.block}</div>
                        <div className="detail-item"><strong>Category:</strong> {ticket.category}</div>
                        <div className="detail-item"><strong>Description:</strong> {ticket.description}</div>
                        <div className="detail-item"><strong>Priority:</strong> {priority}</div> {/* Updated to use state */}
                    </div>
                    {isAdmin ? (
                        <>
                            <div className="modal-section">
                                <h4>Created By</h4>
                                <div className="detail-item"><strong>Name:</strong> {ticket.user_name || "Unknown"}</div>
                                <div className="detail-item"><strong>Contact:</strong> {ticket.user_phone_number || "N/A"}</div>
                            </div>
                            <div className="modal-section">
                                <h4>Assigned To</h4>
                                <div className="detail-item"><strong>Name:</strong> {ticket.technician_name || "Unknown"}</div>
                                <div className="detail-item"><strong>Contact:</strong> {ticket.technician_phone_number || "N/A"}</div>
                            </div>
                            <div className="modal-section">
                                <h4>Change Priority</h4>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="priority-select"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                                <button
                                    onClick={handlePriorityUpdate}
                                    className="action-button priority-update-button"
                                >
                                    Update Priority
                                </button>
                            </div>
                        </>
                    ) : isTechnician ? (
                        <div className="modal-section">
                            <h4>Created By</h4>
                            <div className="detail-item"><strong>Name:</strong> {ticket.user_name || "Unknown"}</div>
                            <div className="detail-item"><strong>Contact:</strong> {ticket.user_phone_number || "N/A"}</div>
                        </div>
                    ) : (
                        <div className="modal-section">
                            <h4>Assigned To</h4>
                            <div className="detail-item"><strong>Name:</strong> {ticket.technician_name || "Unknown"}</div>
                            <div className="detail-item"><strong>Contact:</strong> {ticket.technician_phone_number || "N/A"}</div>
                        </div>
                    )}
                    <div className="modal-section">
                        <h4>Timeline</h4>
                        <div className="detail-item"><strong>Created At:</strong> {new Date(ticket.created_at).toLocaleString()}</div>
                        <div className="detail-item"><strong>Last Updated:</strong> {new Date(ticket.last_updated).toLocaleString()}</div>
                        <div className="detail-item"><strong>Started Time:</strong> {ticket.started_time ? new Date(ticket.started_time).toLocaleString() : "N/A"}</div>
                        <div className="detail-item"><strong>Closure Time:</strong> {ticket.closure_time ? new Date(ticket.closure_time).toLocaleString() : "N/A"}</div>
                        <div className="detail-item"><strong>SLA Deadline:</strong> {ticket.sla_deadline ? new Date(ticket.sla_deadline).toLocaleString() : "N/A"}</div>
                    </div>
                    <div className="modal-section">
                        <h4>Attachments</h4>
                        {ticket.attachments && ticket.attachments.trim() !== "" ? (
                            <div className="attachments-container">
                                {ticket.attachments.split(", ").map((fileUrl, index) => (
                                    <div key={index} className="attachment-item">
                                        {fileUrl.match(/\.(jpeg|jpg|png|gif|bmp)$/i) ? (
                                            <img
                                                src={fileUrl}
                                                alt={`Attachment ${index + 1}`}
                                                className="attachment-thumbnail"
                                                onClick={() => setSelectedImage(fileUrl)}
                                            />
                                        ) : (
                                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                                Attachment {index + 1}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-attachments">
                                <p>No attachments available.</p>
                            </div>
                        )}
                        {selectedImage && (
                            <div className="image-modal" onClick={() => setSelectedImage(null)}>
                                <div className="image-modal-content">
                                    <span className="close-button" onClick={() => setSelectedImage(null)}>
                                        ×
                                    </span>
                                    <img src={selectedImage} alt="Preview" className="large-image" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-section">
                        <h4>Status Progress</h4>
                        <div className="progress-container">
                            <div className="progress-line"></div>
                            <div className="progress-fill" style={{ width: `${getStatusProgress(status)}%` }}></div>
                            <div className={`progress-step ${status.toLowerCase() === "open" ? "active" : ""}`}>
                                <ClipboardList size={20} />
                            </div>
                            <div className={`progress-step ${status.toLowerCase() === "assigned" ? "active" : ""}`}>
                                <UserCheck size={20} />
                            </div>
                            <div className={`progress-step ${status.toLowerCase().replace(/\s+/g, "") === "inprogress" ? "active" : ""}`}>
                                <Hourglass size={20} />
                            </div>
                            <div className={`progress-step ${status.toLowerCase() === "closed" ? "active" : ""}`}>
                                <CheckCircle size={20} />
                            </div>
                        </div>
                        <p className="progress-text">
                            {status === "Open" ? "Ticket is open and awaiting assignment."
                                : status === "Assigned" ? "Ticket has been assigned to a technician."
                                    : status === "In Progress" ? "Ticket is in progress."
                                        : "Ticket has been resolved or closed."}
                        </p>
                    </div>
                    <div className="modal-section">
                        <h4>Requested Spares</h4>
                        {spares.length > 0 ? (
                            <ul>
                                {spares.map((spare) => (
                                    <li key={spare.request_id}>
                                        {spare.item_name} - {spare.quantity} pcs ({spare.approval_status})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No spares requested for this ticket.</p>
                        )}
                    </div>
                    {isTechnician && status !== "Closed" && (
                        <div className="modal-section">
                            {status.toLowerCase() === "open" || status.toLowerCase() === "assigned" ? (
                                <button onClick={() => handleStatusUpdate("inprogress")} className="action-button">
                                    <Hourglass size={16} style={{ marginRight: '8px' }} />
                                    Update to In Progress
                                </button>
                            ) : status.toLowerCase() === "in progress" ? (
                                <>
                                    <button onClick={handleCloseTicketClick} className="action-button ticket-close-button">
                                        <FaTimesCircle size={16} style={{ marginRight: '8px' }} />
                                        Close Ticket
                                    </button>
                                    {isClosureModalOpen && (
                                        <div className="closure-modal">
                                            <div className="closure-modal-content">
                                                <h4>Enter Closure Log</h4>
                                                <textarea
                                                    placeholder="Enter closure log..."
                                                    value={closureLog}
                                                    onChange={handleClosureLogChange}
                                                    className="closure-modal-textarea"
                                                    rows={4}
                                                />
                                                <div className="closure-modal-buttons">
                                                    <button onClick={handleCloseTicketSubmit} className="submit-closure-button">
                                                        Submit Closure Log
                                                    </button>
                                                    <button onClick={() => setIsClosureModalOpen(false)} className="cancel-button">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : null}
                            <button onClick={() => setOpenSpares(ticket.ticket_id)} className="action-button">
                                <ClipboardList size={16} style={{ marginRight: '8px' }} />
                                Request Spares
                            </button>
                            {openSpares && (
                                <RequestSparesModal
                                    ticketId={openSpares}
                                    onClose={() => setOpenSpares(null)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketModal;