import React from "react";
import { useParams } from "react-router-dom";

const TicketDetails = () => {
    const { ticketId } = useParams();

    return (
        <div>
            <h2>Ticket Details: #{ticketId}</h2>
            {/* Fetch and display ticket details */}
        </div>
    );
};

export default TicketDetails;