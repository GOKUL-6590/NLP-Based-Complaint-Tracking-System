import React, { useState, useEffect } from "react";
import "./AssignedTickets.css";
import { fetchAssignedTickets } from "../../../service/TechnicianService";
import { useDispatch, useSelector } from "react-redux";
import TicketModal from "../../../components/EditTicket/EditTicket";
import { FaTimesCircle, FaTag, FaExclamationCircle, FaMapMarkerAlt, FaClipboardCheck, FaFlag } from "react-icons/fa";
import { hideLoading, showLoading } from "../../../redux/alertSlice";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
        };
        getTickets();
    }, [dispatch, user.id]);

    const openModal = (ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedTicket(null);
        setIsModalOpen(false);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const sourceIndex = parseInt(active.id.split('-')[1]);
        const destIndex = parseInt(over.id.split('-')[1]);

        const newSlotData = [...slotData];
        const [movedSlot] = newSlotData.splice(sourceIndex, 1);
        newSlotData.splice(destIndex, 0, movedSlot);
        setSlotData(newSlotData);
    };

    const SortableTicketSlot = ({ slot, index }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging
        } = useSortable({ id: `slot-${index}` });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
        };

        const ticket = slot.ticket;

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="ticket-slot"
            >
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
    };

    return (
        <div className="assigned-tickets-container">
            <h2 className="page-title-1">Assigned Tickets</h2>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={slotData.map((_, index) => `slot-${index}`)} strategy={horizontalListSortingStrategy}>
                    <div className="ticket-slots">
                        {slotData.map((slot, index) => (
                            <SortableTicketSlot key={index} slot={slot} index={index} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {isModalOpen && <TicketModal ticket={selectedTicket} onClose={closeModal} />}
        </div>
    );
}

export default AssignedTickets;