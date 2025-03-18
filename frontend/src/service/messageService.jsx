import axios from "axios";

// Base URL for the Flask backend (adjustable via environment variables in production)
const BASE_URL = "http://localhost:5000/messages";

// Fetch mapped technicians for a user
export const fetchMappedTechnicians = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/user/mapped-technicians`, {
            params: { user_id: userId },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching mapped technicians:", error);
        throw error;
    }
};

// Fetch mapped users for a technician
export const fetchMappedUsers = async (technicianId) => {
    try {
        const response = await axios.get(`${BASE_URL}/technician/mapped-users`, {
            params: { technician_id: technicianId },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching mapped users:", error);
        throw error;
    }
};

// Fetch messages between a user and a technician
export const fetchMessages = async (userId, technicianId, isTechnician) => {
    try {
        const endpoint = isTechnician ? "technician/messages" : "user/messages";
        const params = isTechnician
            ? { technician_id: userId, user_id: technicianId }
            : { user_id: userId, technician_id: technicianId };
        const response = await axios.get(`${BASE_URL}/${endpoint}`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
};

export const markMessagesAsRead = async (userId, contactId) => {
    try {
        const response = await axios.post(`${BASE_URL}/mark-messages-read`, {
            user_id: userId,
            contact_id: contactId
        });
        return response.data;
    } catch (error) {
        console.error("Error marking messages as read:", error);
        throw error;
    }
};

export const fetchUnreadCounts = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/unread-counts`, {
            params: { user_id: userId }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching unread counts:", error);
        throw error;
    }
};