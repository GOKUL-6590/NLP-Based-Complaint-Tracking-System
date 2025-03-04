import axios from "axios";

const API_URL = 'http://127.0.0.1:5000/technician';

export const getTechnicianStats = async (technicianId) => {
    try {
        const response = await axios.get(`${API_URL}/get-technician-dashboard?technician_id=${technicianId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching technician stats:", error);
        return { success: false, message: "Failed to fetch stats" };
    }
};
export const fetchAssignedTickets = async (technicianId) => {
    try {
        const response = await axios.get(`${API_URL}/get-assigned-tickets-by-technicanId`, {
            params: { tech_id: technicianId }  // Send technician ID as query param
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return { success: false, tickets: [] };
    }
};
export const updateTicketStatus = async (ticketId, status, technician_id, user_id) => {
    try {
        const requestData = {
            ticketId: ticketId,
            status: status,
            technician_id: technician_id,
            user_id: user_id
        };
        const response = await axios.post(`${API_URL}/update_ticket_status`, requestData);

        return response.data;
    } catch (error) {
        console.error("API call failed:", error);
    }
};
export const getAssignedTicketsForTechnician = async (technician_id) => {
    try {

        const response = await axios.get(`${API_URL}/get-all-tickets-by-technicanId`, {
            params: { tech_id: technician_id }  // Send technician ID as query param
        });
        return response.data;
    } catch (error) {
        console.error("API call failed:", error);
    }
};

export const getInventory = async () => {
    try {
        const response = await axios.get(`${API_URL}/get-all-items`);
        return response.data;
    } catch (error) {
        console.error("API call failed:", error);
    }
};

export const requestSpares = async (requestData) => {
    try {
        const response = await axios.post(`${API_URL}/send-spares-request-to-admin`, requestData);
        return response.data;
    } catch (error) {
        console.error("API call failed:", error);
    }
};

export const getRequestedSpares = async (ticketId) => {
    try {
        const response = await axios.get(`${API_URL}/get-requested-spares-by-ticketId`, {
            params: { ticketId }, // Sending ticketId as a query parameter
        });
        return response.data; // Returning the response data
    } catch (error) {
        console.error("API call failed:", error);
        return []; // Returning an empty array in case of failure
    }
};


export const closeTicket = async (ticketId, status, closureLog, technician_id, userId) => {
    try {
        const requestData = {
            ticketId: ticketId,
            status: status,
            closure_log: closureLog,
            technician_id: technician_id,
            user_id: userId
        };
        const response = await axios.post(`${API_URL}/close_ticket`, requestData); // New endpoint
        return response.data;
    } catch (error) {
        console.error("API call failed:", error);
        return { success: false, error };
    }
};

