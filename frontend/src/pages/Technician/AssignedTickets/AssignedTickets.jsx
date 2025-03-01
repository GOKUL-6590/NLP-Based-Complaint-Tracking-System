import React, { useState, useEffect } from "react";
import "./AssignedTickets.css";
import { fetchAssignedTickets } from "../../../service/TechnicianService";
import { useDispatch, useSelector } from "react-redux";
import TicketModal from "../../../components/EditTicket/EditTicket";
import { FaTimesCircle, FaTag, FaExclamationCircle, FaMapMarkerAlt, FaClipboardCheck, FaFlag } from "react-icons/fa";
import { hideLoading, showLoading } from "../../../redux/alertSlice";

function AssignedTickets() {
    const dispatch = useDispatch();
    const [assignedTickets, setAssignedTickets] = useState([]);
    const { user } = useSelector((state) => state.user);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [slotData, setSlotData] = useState([
        { ticket: null, title: "Ticket Slot 1" },
        { ticket: null, title: "Ticket Slot 2" },
        { ticket: null, title: "Emergency Ticket" }
    ]);
    const [isInitialLoad, setIsInitialLoad] = useState(true); // New state for initial load

    useEffect(() => {
        const getTickets = async () => {
            dispatch(showLoading());
            const data = await fetchAssignedTickets(user.id);
            dispatch(hideLoading());
            if (data.success) {
                setAssignedTickets(data.tickets);
                const emergencyTicket = data.tickets.find(t => t.is_emergency === 1) || null;
                const nonEmergencyTickets = data.tickets.filter(t => t.is_emergency !== 1);
                const newSlotData = [
                    { ticket: nonEmergencyTickets[0] || null, title: "Ticket Slot 1" },
                    { ticket: nonEmergencyTickets[1] || null, title: "Ticket Slot 2" },
                    { ticket: emergencyTicket || null, title: "Emergency Ticket" }
                ];
                setSlotData(newSlotData);
            }
            // After data is fetched, mark initial load as complete
            setTimeout(() => setIsInitialLoad(false), 1000); // Delay to match animation duration
        };
        getTickets();
    }, [dispatch, user.id]);

    const openModal = (ticket) => {
        console.log("Opening modal for ticket:", ticket);
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        console.log("Closing modal");
        setSelectedTicket(null);
        setIsModalOpen(false);
    };

    const TicketSlot = ({ slot }) => {
        const ticket = slot.ticket;

        return (
            <div className={`ticket-slot ${isInitialLoad ? "animate-on-load" : ""}`}>
                <h3 className="ticket-title">{slot.title}</h3>
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
                        <p 
                            className="view-details" 
                            onClick={() => openModal(ticket)}
                        >
                            View Details
                        </p>
                    </>
                ) : (
                    <div className="empty-slot">
                        <FaTimesCircle className="empty-icon" />
                        <p>No ticket assigned</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="assigned-tickets-container">
            <h2 className={`page-title-1 ${isInitialLoad ? "animate-on-load" : ""}`}>Assigned Tickets</h2>
            <div className={`ticket-slots ${isInitialLoad ? "animate-on-load" : ""}`}>
                {slotData.map((slot, index) => (
                    <TicketSlot key={index} slot={slot} />
                ))}
            </div>

            {isModalOpen && <TicketModal ticket={selectedTicket} onClose={closeModal} />}
        </div>
    );
}

export default AssignedTickets;