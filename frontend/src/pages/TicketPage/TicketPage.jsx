import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../redux/alertSlice";
import { toast } from "react-hot-toast";
import { getTicketDetails, submitTicketFeedback } from "../../service/userService";
import { CheckCircle, Hourglass, UserCheck, ClipboardList } from "lucide-react";
import "./TicketPage.css";

const TicketDetails = () => {
    const { ticketId } = useParams();
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [ticketData, setTicketData] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                dispatch(showLoading());
                const token = localStorage.getItem("token");
                const data = await getTicketDetails(ticketId, token);
                setTicketData(data.ticket);
            } catch (error) {
                console.error(error);
                toast.error(error.message);
            } finally {
                dispatch(hideLoading());
                setLoading(false);
            }
        };

        fetchTicketDetails();
    }, [ticketId, dispatch]);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.trim()) {
            toast.error("Feedback cannot be empty");
            return;
        }

        try {
            dispatch(showLoading());
            const token = localStorage.getItem("token");
            await submitTicketFeedback(ticketId, feedback, user.id, token);
            toast.success("Feedback submitted successfully");
            setFeedback("");
            setRating(0);
            const data = await getTicketDetails(ticketId, token);
            setTicketData(data.ticket);
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            dispatch(hideLoading());
        }
    };

    const getStatusProgress = (status) => {
        switch (status.toLowerCase().replace(/\s+/g, "")) {
            case "open": return 0;
            case "assigned": return 33;
            case "inprogress": return 66;
            case "closed": return 100;
            default: return 0;
        }
    };

    if (loading || !ticketData) {
        return <div className="loading">Loading ticket details...</div>;
    }

    const { ticket, attachments, spare_requests, closure_logs, feedback: feedbackList } = ticketData;
    const isUser = user.role === "user";
    const isClosed = ticket.status === "Closed";
    const hasFeedback = feedbackList.length > 0;

    return (
        <div className="ticket-details-page">
            <header className="page-header">
                <h1>Ticket #{ticket.ticket_id}</h1>
            </header>
            <main className="page-content">
                {/* Row 1: Ticket Information (Split into 2 Columns) */}
                <div className="row row-1">
                    <section className="section ticket-info-left">
                        <h2>Ticket Information (1/2)</h2>
                        <div className="section-content">
                            <p><strong>Ticket ID:</strong> {ticket.ticket_id}</p>
                            <p><strong>System Number:</strong> {ticket.system_number}</p>
                            <p><strong>Venue:</strong> {ticket.venue}</p>
                            <p><strong>Block:</strong> {ticket.block}</p>
                            <p><strong>Category:</strong> {ticket.category}</p>
                            <p><strong>Priority:</strong> {ticket.priority}</p>
                        </div>
                    </section>
                    <section className="section ticket-info-right">
                        <h2>Ticket Information (2/2)</h2>
                        <div className="section-content">
                            <p><strong>Description:</strong> {ticket.description}</p>
                            <p><strong>Status:</strong> <span className={`status-${ticket.status.toLowerCase().replace(" ", "-")}`}>{ticket.status}</span></p>
                            <p><strong>User:</strong> {ticket.user_name}</p>
                            <p><strong>Technician:</strong> {ticket.technician_name || "Not Assigned"}</p>
                            <p><strong>Created At:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
                            <p><strong>Started Time:</strong> {ticket.started_time ? new Date(ticket.started_time).toLocaleString() : "N/A"}</p>
                            <p><strong>SLA Deadline:</strong> {ticket.sla_deadline ? new Date(ticket.sla_deadline).toLocaleString() : "N/A"}</p>
                            <p><strong>Assigned by Admin:</strong> {ticket.assigned_by_admin ? "Yes" : "No"}</p>
                        </div>
                    </section>
                </div>

                {/* Row 2: Attachments, Spare Requests, Status */}
                <div className="row row-2">
                    <section className="section attachments">
                        <h2>Attachments</h2>
                        <div className="section-content">
                            {attachments.length > 0 ? (
                                <div className="attachments-container">
                                    {attachments.map((attachment) => (
                                        <div key={attachment.id} className="attachment-item">
                                            {attachment.file_path.match(/\.(jpeg|jpg|png|gif|bmp)$/i) ? (
                                                <img
                                                    src={attachment.file_path}
                                                    alt={attachment.file_name}
                                                    className="attachment-thumbnail"
                                                    onClick={() => setSelectedImage(attachment.file_path)}
                                                />
                                            ) : (
                                                <a href={attachment.file_path} target="_blank" rel="noopener noreferrer">{attachment.file_name}</a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data"> Not Available</p>
                            )}
                            {selectedImage && (
                                <div className="image-preview" onClick={() => setSelectedImage(null)}>
                                    <div className="image-preview-content">
                                        <span className="close-preview" onClick={() => setSelectedImage(null)}>×</span>
                                        <img src={selectedImage} alt="Preview" className="preview-image" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                    <section className="section spare-requests">
                        <h2>Spare Requests</h2>
                        <div className="section-content">
                            {
                                spare_requests.length > 0 ? (
                                    <ul className="spares-list">
                                        {spare_requests.map((request) => (
                                            <li key={request.request_id}>
                                                {request.part_name} - {request.quantity} pcs ({request.approval_status})
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-data"> Not Available</p>
                                )
                            }
                        </div>
                    </section>
                    <section className="section status-progress">
                        <h2>Status Progress</h2>
                        <div className="section-content">
                            <div className="progress-container">
                                <div className="progress-line"></div>
                                <div className="progress-fill" style={{ width: `${getStatusProgress(ticket.status)}%` }}></div>
                                <div className={`progress-step ${ticket.status.toLowerCase() === "open" ? "active" : ""}`}>
                                    <ClipboardList size={20} />
                                </div>
                                <div className={`progress-step ${ticket.status.toLowerCase() === "assigned" ? "active" : ""}`}>
                                    <UserCheck size={20} />
                                </div>
                                <div className={`progress-step ${ticket.status.toLowerCase().replace(/\s+/g, "") === "inprogress" ? "active" : ""}`}>
                                    <Hourglass size={20} />
                                </div>
                                <div className={`progress-step ${ticket.status.toLowerCase() === "closed" ? "active" : ""}`}>
                                    <CheckCircle size={20} />
                                </div>
                            </div>
                            <p className="progress-text">
                                {ticket.status === "Open" ? "Ticket is open and awaiting assignment."
                                    : ticket.status === "Assigned" ? "Ticket has been assigned to a technician."
                                        : ticket.status === "In Progress" ? "Ticket is in progress."
                                            : "Ticket has been resolved or closed."}
                            </p>
                        </div>
                    </section>
                </div>

                {/* Row 3: Closure Logs, Feedback */}
                <div className="row row-3">
                    <section className="section closure-logs">
                        <h2>Closure Logs</h2>
                        <div className="section-content">
                            {closure_logs.length > 0 ? (
                                <ul className="logs-list">
                                    {closure_logs.map((log) => (
                                        <li key={log.log_id}>
                                            {log.log} (Timestamp: {new Date(log.timestamp).toLocaleString()})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-data"> Not Available</p>
                            )}
                        </div>
                    </section>
                    <section className="section feedback">
                        <h2>Feedback</h2>
                        <div className="section-content">
                            {feedbackList.length > 0 ? (
                                <ul className="feedback-list">
                                    {feedbackList.map((fb) => (
                                        <li key={fb.feedback_id}>
                                            Rating: {fb.rating || "N/A"} - {fb.comments || "No comments"} (By: {fb.feedback_user_name})
                                        </li>
                                    ))}
                                </ul>
                            ) : isUser && isClosed ? (
                                <form onSubmit={handleFeedbackSubmit}>
                                    <div className="rating-section">
                                        <label>Rating (1-5):</label>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`star ${rating >= star ? "filled" : ""}`}
                                                onClick={() => setRating(star)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Enter your feedback here..."
                                        rows="3"
                                        className="feedback-input"
                                    />
                                    <button type="submit" className="submit-button">Submit Feedback</button>
                                </form>
                            ) : (
                                <p className="no-data"> Not Available</p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default TicketDetails;