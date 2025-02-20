import axios from "axios";

const API_URL = 'http://127.0.0.1:5000/users';

export const createTicket = async (formData) => {
    try {
        console.log(formData)
        const response = await axios.post(`${API_URL}/raise-ticket`, formData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data; // Return the response to the calling function
    } catch (error) {
        console.error("Error in API call:", error);
        throw error; // Rethrow the error to handle it in the calling function
    }
};

export const getDashboardStats = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/get-user-dashboard`, {
            params: { user_id: userId }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
};
export const disputeTicket = async (ticketId) => {
    try {
        const response = await axios.post(`${API_URL}/dispute-ticket-by-id`, {
            ticket_id: ticketId // Send in the request body
        });
        return response.data;
    } catch (error) {
        console.error("Error disputing :", error);
        throw error;
    }
};
export const getTicketHistoryByUser = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/get-ticket-history-by-userid`, {
            params: { user_id: userId }
        });
        return response.data;
    } catch (error) {
        console.error("Error disputing :", error);
        throw error;
    }
};



