import React, { useState, useEffect } from "react";
import { assignTicketToTechnician, getAssignedTickets, getUnassignedTickets } from "../../../service/adminService"; // Adjust path if necessary
import "./ManageTickets.css";
import TicketDetailsModal from "../../../components/TicketDetailsModal/TicketDetailsModal";
import AssignTechnicianModal from "../../../components/AssignTechnicianModal/AssignTechnicianModal";
import toast from "react-hot-toast"
import socket from "../../../components/socket";
import { useDispatch, useSelector } from "react-redux";
import TicketModal from "../../../components/EditTicket/EditTicket";
import { hideLoading, showLoading } from "../../../redux/alertSlice";

const ManageTickets = () => {
    const [assignedTickets, setAssignedTickets] = useState([]);
    const [unassignedTickets, setUnassignedTickets] = useState([]);
    const [searchAssigned, setSearchAssigned] = useState("");
    const [searchUnassigned, setSearchUnassigned] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        fetchAssignedTickets();
        fetchUnassignedTickets();
        socket.emit("join", user.id); // Join room for real-time notifications

        socket.on("ticket-assigned", (data) => {
            console.log("Ticket assigned event received:", data);
            setAssignedTickets(data.assigned);
            setUnassignedTickets(data.unassigned);
        });

        return () => {
            socket.off("ticket-assigned");
        };
    }, []);

    const fetchAssignedTickets = async () => {
        try {
            dispatch(showLoading())
            const response = await getAssignedTickets();
            dispatch(hideLoading())
            setAssignedTickets(response.tickets);
        } catch (error) {
            dispatch(hideLoading())
            console.error("Error fetching assigned tickets:", error);
        }
    };

    const fetchUnassignedTickets = async () => {
        try {
            dispatch(showLoading())
            const response = await getUnassignedTickets();
            dispatch(hideLoading())
            setUnassignedTickets(response.tickets);
        } catch (error) {
            dispatch(hideLoading())
            console.error("Error fetching unassigned tickets:", error);
        }
    };

    const handleAssignTicket = async (technician, assignType) => {
        try {
            console.log(selectedTicket.ticket_id, technician, assignType)
            dispatch(showLoading())
            const response = await assignTicketToTechnician(selectedTicket.ticket_id, technician.technician_id, assignType);
            dispatch(hideLoading())
            socket.emit("ticket-assigned", user.id);
            setIsAssignModalOpen(false);
            setSelectedTicket(null)
            if (response.success) {
                fetchAssignedTickets();
                fetchUnassignedTickets(); // Refresh unassigned tickets after assignment
                toast.success("Ticket assigned successfully.");
            }

        } catch (error) {
            dispatch(hideLoading())
            console.error("Error assigning ticket:", error);
            toast.error("Failed to assign ticket.");
        }
    };

    const filteredAssignedTickets = assignedTickets.filter(ticket =>
        ticket.description.toLowerCase().includes(searchAssigned.toLowerCase())
    );

    const filteredUnassignedTickets = unassignedTickets.filter(ticket =>
        ticket.description.toLowerCase().includes(searchUnassigned.toLowerCase())
    );

    const handleTicketClick = (ticket) => {
        // Open TicketDetailsModal when clicking anywhere except the "Assign" button
        if (!isAssignModalOpen) {
            setSelectedTicket(ticket);
        }
    };

    return (
        <div className="manage-tickets-container">
            {/* Assigned Tickets Section */}
            <div className="tickets-column">
                <div className="section-header">
                    <h2 className="section-title">Assigned Tickets</h2>
                    <input
                        type="text"
                        placeholder="Search assigned tickets..."
                        className="search-bar"
                        value={searchAssigned}
                        onChange={e => setSearchAssigned(e.target.value)}
                    />
                </div>
                <table className="ticket-table">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Technician</th>
                            <th>SLA Deadline</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssignedTickets.length > 0 ? (
                            filteredAssignedTickets.map(ticket => (
                                <tr key={ticket.ticket_id} onClick={() => handleTicketClick(ticket)} className="ticket-row">
                                    <td>{ticket.ticket_id}</td>
                                    <td>{ticket.category}</td>
                                    <td>{ticket.status}</td>
                                    <td>{ticket.technician_name}</td>
                                    <td>{ticket.sla_deadline}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5">No assigned tickets available.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Unassigned Tickets Section */}
            <div className="tickets-column">
                <div className="section-header">
                    <h2 className="section-title">Unassigned Tickets</h2>
                    <input
                        type="text"
                        placeholder="Search unassigned tickets..."
                        className="search-bar"
                        value={searchUnassigned}
                        onChange={e => setSearchUnassigned(e.target.value)}
                    />
                </div>
                <table className="ticket-table">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>SLA Breached</th>
                            <th>Assign</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUnassignedTickets.length > 0 ? (
                            filteredUnassignedTickets.map(ticket => (
                                <tr key={ticket.ticket_id} onClick={() => handleTicketClick(ticket)} className="ticket-row">
                                    <td>{ticket.ticket_id}</td>
                                    <td>{ticket.category}</td>
                                    <td>{ticket.status}</td>
                                    <td>{ticket.priority}</td>
                                    <td>{new Date(ticket.sla_deadline).getTime() < Date.now() ? "Yes" : "No"}</td>
                                    <td>
                                        <button onClick={() => {
                                            setSelectedTicket(ticket);
                                            setIsAssignModalOpen(true); // Only opens Assign modal
                                        }} className="assignButton">
                                            Assign
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6">No unassigned tickets available.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Ticket Details Modal */}
            {selectedTicket && !isAssignModalOpen && (
                <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
            )}

            {/* Assign Technician Modal */}
            {isAssignModalOpen && (
                <AssignTechnicianModal
                    ticket={selectedTicket}
                    onClose={() => { setIsAssignModalOpen(false), setSelectedTicket(null) }}
                    onAssign={handleAssignTicket}
                />
            )}
        </div>
    );
};

export default ManageTickets;
