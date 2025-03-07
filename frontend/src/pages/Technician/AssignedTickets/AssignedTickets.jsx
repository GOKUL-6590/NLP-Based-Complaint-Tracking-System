import React, { useState, useEffect } from "react";
import "./AssignedTickets.css";
import { fetchAssignedTickets } from "../../../service/TechnicianService";
import { useDispatch, useSelector } from "react-redux";
import TicketModal from "../../../components/EditTicket/EditTicket";
import { FaTimesCircle, FaTag, FaExclamationCircle, FaMapMarkerAlt, FaClipboardCheck, FaFlag } from "react-icons/fa";
import { hideLoading, showLoading } from "../../../redux/alertSlice";
import socket from "../../../components/socket"; // Import socket

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
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const updateSlotData = (tickets) => {
        const emergencyTicket = tickets.find(t => t.is_emergency === 1) || null;
        const nonEmergencyTickets = tickets.filter(t => t.is_emergency !== 1);
        const newSlotData = [
            { ticket: nonEmergencyTickets[0] || null, title: "Ticket Slot 1" },
            { ticket: nonEmergencyTickets[1] || null, title: "Ticket Slot 2" },
            { ticket: emergencyTicket || null, title: "Emergency Ticket" }
        ];
        setSlotData(newSlotData);
    };

    useEffect(() => {
        socket.emit("join", user?.id);
        const getTickets = async () => {
            dispatch(showLoading());
            const data = await fetchAssignedTickets(user.id);
            dispatch(hideLoading());
            if (data.success) {
                setAssignedTickets(data.tickets);
                updateSlotData(data.tickets);
            }
            setTimeout(() => setIsInitialLoad(false), 1000);
        };
        getTickets();

        // Request initial technician-assigned tickets
        socket.emit("technician-assigned-tickets", user.id);

        // WebSocket listener
        socket.on("technician-assigned-tickets", (data) => {
            if (data.technician_id === user.id) {
                setAssignedTickets(data.tickets);
                updateSlotData(data.tickets);
            }
        });

        // Cleanup
        return () => {
            socket.off("technician-assigned-tickets");
        };
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

    const handleStatusUpdate = (ticketId, newStatus) => {
        const updatedTickets = assignedTickets.map(ticket =>
            ticket.ticket_id === ticketId ? { ...ticket, status: newStatus } : ticket
        );
        setAssignedTickets(updatedTickets);
        updateSlotData(updatedTickets);
    };

    const handleCloseTicket = (ticketId, closureLog) => {
        const updatedTickets = assignedTickets.map(ticket =>
            ticket.ticket_id === ticketId ? { ...ticket, status: "Closed" } : ticket
        );
        setAssignedTickets(updatedTickets);
        updateSlotData(updatedTickets);
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

            {isModalOpen && (
                <TicketModal
                    ticket={selectedTicket}
                    onClose={closeModal}
                    onStatusUpdate={handleStatusUpdate}
                    onCloseTicket={handleCloseTicket}
                />
            )}
        </div>
    );
}

export default AssignedTickets;