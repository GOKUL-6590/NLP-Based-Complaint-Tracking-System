import React, { useState, useEffect } from "react";
import "./AssignedTickets.css";
import { fetchAssignedTickets } from "../../../service/TechnicianService";
import { useDispatch, useSelector } from "react-redux";
import TicketModal from "../../../components/EditTicket/EditTicket";
import { FaTimesCircle, FaTag, FaExclamationCircle, FaMapMarkerAlt, FaClipboardCheck, FaFlag } from "react-icons/fa";
import { hideLoading, showLoading } from "../../../redux/alertSlice";

function AssignedTickets() {
    const dispatch = useDispatch()
    const [assignedTickets, setAssignedTickets] = useState([]);
    const { user } = useSelector((state) => state.user);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const getTickets = async () => {
            dispatch(showLoading())
            const data = await fetchAssignedTickets(user.id);
            dispatch(hideLoading())
            if (data.success) {
                setAssignedTickets(data.tickets);
            }
        };
        getTickets();
    }, []);

    const openModal = (ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedTicket(null);
        setIsModalOpen(false);
    };

    return (
        <div className="assigned-tickets-container">
            <h2 className="page-title-1">Assigned Tickets</h2>
            <div className="ticket-slots">
                {[0, 1, 2].map((index) => {
                    const ticket = assignedTickets[index] || null;
                    return (
                        <div key={index} className="ticket-slot">
                            <h3 className="ticket-title">
                                {index === 2 ? "Emergency Ticket" : `Ticket Slot ${index + 1}`}
                            </h3>
                            {ticket ? (
                                <>
                                    <div className="ticket-details">
                                        <p><FaTag className="icon" /><strong>ID:</strong> {ticket.ticket_id}</p>
                                        <p><FaExclamationCircle className="icon" /><strong>Category:</strong> {ticket.category}</p>
                                        <p><FaClipboardCheck className="icon" /><strong>Status:</strong>
                                            <span className={`status ${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                                        </p>
                                        <p><FaFlag className="icon" /><strong>Priority:</strong>
                                            <span className={`priority ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                                        </p>
                                        <p><FaMapMarkerAlt className="icon" /><strong>Venue:</strong> {ticket.venue}</p>
                                    </div>

                                    <p className="view-details" onClick={() => openModal(ticket)}>View Details</p>
                                </>
                            ) : (
                                <div className="empty-slot">
                                    <FaTimesCircle className="empty-icon" />
                                    <p>No ticket assigned</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {isModalOpen && <TicketModal ticket={selectedTicket} onClose={closeModal} />}
        </div>
    );
}

export default AssignedTickets;
