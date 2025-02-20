import React, { useState, useEffect } from "react";
import { getTechniciansAvailability } from "../../service/adminService";
import "./AssignTechnicianModal.css";

const AssignTechnicianModal = ({ ticket, onClose, onAssign }) => {
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [assignType, setAssignType] = useState(""); // "regular" or "sla"

    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const response = await getTechniciansAvailability();
                setTechnicians(response.technicians);
            } catch (error) {
                console.error("Error fetching technicians:", error);
            }
        };

        fetchTechnicians();
    }, [ticket]);

    const handleAssign = () => {
        if (selectedTechnician && assignType) {
            onAssign(selectedTechnician, assignType);
        }
    };

    return (
        <div className="assign-technician-modal">
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="modal-content">
                {/* Modal Header */}
                <div className="modal-header">
                    <h2>Assign Technician</h2>
                    <p className="ticket-id">Ticket ID: {ticket.ticket_id}</p>
                </div>

                {/* Technician List */}
                <div className="technician-list">
                    <p className="availability-text">Technician Availability:</p>
                    {technicians.length > 0 ? (
                        technicians.map(technician => {
                            const availableSlots = 2 - technician.current_assigned_tickets;
                            const isSlaAvailable = technician.sla_breached_slot === 0;

                            return (
                                <div key={technician.technician_id} className="technician-container">
                                    <div className="technician-info">
                                        <span className="technician-name">{technician.technician_name}</span>
                                        <div className="slots-info">
                                            <span className={`slot ${availableSlots > 0 ? "available" : "filled"}`}>
                                                Regular Slots: {availableSlots > 0 ? availableSlots : "Full"}
                                            </span>
                                            <span className={`slot ${isSlaAvailable ? "available" : "filled"}`}>
                                                SLA Breach Slot: {isSlaAvailable ? "Available" : "Filled"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="assign-buttons">
                                        {availableSlots > 0 && (
                                            <button
                                                className={`assign-button ${selectedTechnician?.technician_id === technician.technician_id && assignType === "regular" ? "selected" : ""}`}
                                                onClick={() => { setSelectedTechnician(technician); setAssignType("regular"); }}
                                            >
                                                Assign Regular
                                            </button>
                                        )}
                                        {isSlaAvailable && (
                                            <button
                                                className={`assign-button ${selectedTechnician?.technician_id === technician.technician_id && assignType === "sla" ? "selected" : ""}`}
                                                onClick={() => { setSelectedTechnician(technician); setAssignType("sla"); }}
                                            >
                                                Assign SLA Breach
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="no-technicians">No technicians available.</p>
                    )}
                </div>

                {/* Modal Actions */}
                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-button">Cancel</button>
                    <button onClick={handleAssign} className="assign-button" disabled={!selectedTechnician}>
                        Assign
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignTechnicianModal;
