import React from "react";
import "./TechnicanCard.css"

const TechnicianModal = ({ technician, onClose }) => {
    // Helper to get initials from name
    const getInitials = (name) => {
        const words = name.split(" ");
        return words.length > 1
            ? `${words[0][0]}${words[1][0]}`
            : words[0].slice(0, 2).toUpperCase();
    };

    return (
        <div className="technician-modal" onClick={onClose}>
            <div className="technician-modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="modal-close" onClick={onClose}>×</span>
                <div className="avatar">
                    {technician?.profile_picture ? (
                        <img
                            src={technician.profile_picture}
                            alt={technician.name}
                            className="avatar-img"
                        />
                    ) : (
                        <span className="avatar-initials">{getInitials(technician?.name || "Unknown")}</span>
                    )}
                </div>
                <h3>{technician?.name || "Unknown"}</h3>
                <div className="details">
                    <p><strong>Role:</strong> {technician?.role || "N/A"}</p>
                    <p><strong>Contact:</strong> {technician?.phone_number || "N/A"}</p>
                    <p><strong>Total Tickets:</strong> {technician?.total_tickets || "N/A"}</p>
                    <p><strong>Resolved Tickets:</strong> {technician?.resolved_tickets || "N/A"}</p>
                </div>
            </div>
        </div>
    );
};

export default TechnicianModal;