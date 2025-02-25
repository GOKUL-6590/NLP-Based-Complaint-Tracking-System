import React, { useState, useEffect } from "react";
import { CheckCircle, Hourglass, UserCheck, ClipboardList, FileText } from "lucide-react";
import "./EditTicket.css";
import { FaTimesCircle } from "react-icons/fa";
import { getRequestedSpares, updateTicketStatus } from "../../service/TechnicianService";
import socket from "../socket";
import { useSelector } from "react-redux";
import RequestSparesModal from "../RequestSpares/RequestSpares";

const TicketModal = ({ ticket, onClose, onStatusUpdate, onCloseTicket, onRequestSpares, onDispute }) => {
    if (!ticket) return null;

    const [closureLog, setClosureLog] = useState("");
    const [openSpares, setOpenSpares] = useState();
    const [spares, setSpares] = useState([]);

    const [status, setStatus] = useState(ticket.status);
    const [timer, setTimer] = useState(null); // To hold the timer interval ID
    const [timeLeft, setTimeLeft] = useState(0); // To track the time remaining
    const [isDisputed, setIsDisputed] = useState(false); // To track if the process is disputed
    const { user } = useSelector((state) => state.user)
    const [selectedImage, setSelectedImage] = useState(null);

    // Function to determine progress width and active step
    const getStatusProgress = (status) => {
        switch (status.toLowerCase().replace(/\s+/g, "")) {  // Remove spaces to match properly
            case "open":
                return 0;
            case "assigned":
                return 33;
            case "inprogress":
                return 66;
            case "closed":
                return 100;
            default:
                return 0;
        }
    };

    const isTechnician = user.role === "technician";
    const isAdmin = user.role === "admin";
    // Handle closure log input
    const handleClosureLogChange = (e) => {
        setClosureLog(e.target.value);
    };

    // Handle the status update
    const handleStatusUpdate = async (newStatus) => {
        setStatus(newStatus);
        // onStatusUpdate(ticket.ticket_id, newStatus);
        console.log("Updated Status:", ticket);  // Debugging


        // Start timer if status is updated to 'In Progress'
        if (newStatus.toLowerCase() === "inprogress") {
            const response = await updateTicketStatus(ticket.ticket_id, "In Progress", user.id, ticket.id)
            if (response.success) {
                socket.emit("inprogress-update", ticket.user_id); // Emit update
                socket.emit("unread-notifications", ticket.user_id); // Emit update
                setStatus(newStatus);


            }
        }
    };



    // Handle closure action
    const handleCloseTicket = () => {
        if (closureLog.trim() === "") {
            alert("Please provide a closure log.");
        } else {
            onCloseTicket(ticket.ticket_id, closureLog);
        }
    };
    useEffect(() => {
        console.log(ticket)
        const fetchSpares = async () => {
            console.log(ticket.ticket_id)

            const response = await getRequestedSpares(ticket.ticket_id); // Call the service function
            setSpares(response.requested_spares);
        };

        if (ticket.ticket_id) {
            fetchSpares();
        }
    }, [ticket.ticket_id]);


    return (
        <div className="ticket-modal">
            <div className="ticket-modal-content">
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
                        <div className="detail-item"><strong>System Number:</strong> {ticket.system_number}</div>
                        <div className="detail-item"><strong>Venue:</strong> {ticket.venue}, {ticket.block}</div>
                        <div className="detail-item"><strong>Category:</strong> {ticket.category}</div>
                        <div className="detail-item"><strong>Description:</strong> {ticket.description}</div>
                        <div className="detail-item"><strong>Priority:</strong> {ticket.priority}</div>
                    </div>

                    {
                        isAdmin ? (
                            <>
                                <div className="modal-section">
                                    <h4>Created By</h4>
                                    <div className="detail-item"><strong>Name:</strong> {ticket.user_name || "Unknown"}</div>
                                    <div className="detail-item"><strong>Contact:</strong> {ticket.user_phone_number || "N/A"}</div>
                                </div>
                                <div className="modal-section">
                                    <h4>Assigned To</h4>
                                    <div className="detail-item"><strong>Name:</strong> {ticket.Technician_name || "Unknown"}</div>
                                    <div className="detail-item"><strong>Contact:</strong> {ticket.Technician_phone_number || "N/A"}</div>
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
                                <div className="detail-item"><strong>Name:</strong> {ticket.Technician_name || "Unknown"}</div>
                                <div className="detail-item"><strong>Contact:</strong> {ticket.Technician_phone_number || "N/A"}</div>
                            </div>
                        )
                    }


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

                        {/* Image Preview Modal */}
                        {selectedImage && (
                            <div className="image-modal" onClick={() => setSelectedImage(null)}>
                                <div className="image-modal-content">
                                    <span className="close-button" onClick={() => setSelectedImage(null)}>
                                        &times;
                                    </span>
                                    <img src={selectedImage} alt="Preview" className="large-image" />
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Status Progress Bar */}
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


                    {/* Action Buttons */}
                    {isTechnician && status !== "closed" && (
                        <div className="modal-section">
                            {status.toLowerCase() === "open" || status.toLowerCase() === "assigned" ? (
                                <button onClick={() => handleStatusUpdate("inprogress")} className="action-button">
                                    <Hourglass size={16} style={{ marginRight: '8px' }} />
                                    Update to In Progress
                                </button>
                            ) : status.toLowerCase() === "in progress" ? (
                                <>
                                    <button onClick={handleCloseTicket} className="action-button ticket-close-button">
                                        <FaTimesCircle size={16} style={{ marginRight: '8px' }} />
                                        Close Ticket
                                    </button>

                                    {closureLog && (
                                        <div className="closure-log-section">
                                            <textarea
                                                placeholder="Enter closure log..."
                                                value={closureLog}
                                                onChange={handleClosureLogChange}
                                                className="closure-textarea"
                                            />
                                            <button onClick={handleCloseTicket} className="submit-closure-button">
                                                Submit Closure Log
                                            </button>
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



                    {/* Closure Log Input */}
                    {status === "Closed" && (
                        <div className="modal-section">
                            <h4>Closure Log</h4>
                            <textarea
                                value={closureLog}
                                onChange={handleClosureLogChange}
                                placeholder="Enter closure log"
                                rows={4}
                                className="closure-log-textarea"
                            />
                            <button onClick={handleCloseTicket} className="action-button">Close Ticket</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketModal;
