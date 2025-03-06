import axios from 'axios';


const API_URL = 'http://127.0.0.1:5000/admin';

export const getUnapprovedTechnicians = async () => {
    try {
        const response = await axios.get(`${API_URL}/unapproved-technicians`);

        return response.data;
    } catch (error) {
        console.error('Error during registration:', error.response?.data || error.message);
        throw error;
    }
};


// Function to handle technician approval or rejection
export const sendTechnicianApprovalRejection = async (technicianId, action) => {
    try {
        const response = await axios.post(`${API_URL}/technician-approval-or-rejection/${action}`, { technicianId });
        return response;
    } catch (error) {
        console.error("Error sending technician approval/rejection:", error);
        throw error;
    }
};


export const getApprovedTechnicians = async () => {
    const response = await fetch(`${API_URL}/approved-technicians`);
    if (!response.ok) {
        throw new Error("Failed to fetch approved technicians");
    }
    return await response.json();
};

export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/get-users`);
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        return { users: [] };
    }
};

export const fetchAdminDashboardData = async () => {
    try {
        const response = await axios.get(`${API_URL}/get-admin-dashboard`);
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return null;
    }
};

export const getAssignedTickets = async () => {
    try {
        const response = await axios.get(`${API_URL}/get-assigned-tickets`);
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return null;
    }
};

export const getUnassignedTickets = async () => {
    try {
        const response = await axios.get(`${API_URL}/get-unassigned-tickets`);
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return null;
    }
};

// service/adminService.js
export const getTechniciansAvailability = async () => {
    try {
        const response = await axios.get(`${API_URL}/technicians-availability`);

        return response.data;
    } catch (error) {
        console.error("Error fetching technicians:", error);
        throw error;
    }
};

export const assignTicketToTechnician = async (ticketId, technicianId, assignType) => {
    try {
        // Construct the request body
        const requestData = {
            ticketId: ticketId,
            technicianId: technicianId,
            assignType: assignType
        };
        console.log(requestData)

        // Make the POST request with the data
        const response = await axios.post(`${API_URL}/assign-ticket-by-admin`, requestData);

        return response.data;
    } catch (error) {
        console.error("Error assigning ticket:", error);
        throw error;
    }
};
export const getAllTickets = async () => {
    try {

        const response = await axios.get(`${API_URL}/get-all-tickets`);
        return response.data;
    } catch (error) {
        console.error("API call failed:", error);
    }
}
export const getTechnicianPerformanceMetrics = async () => {
    try {

        const response = await axios.get(`${API_URL}/get-all-technician-metrics`);
        return response.data;
    } catch (error) {
        console.error("API call failed:", error);
    }
}
export const addItemToInventory = async (itemData) => {
    try {
        console.log("Sending item data:", itemData);

        // Make the POST request with the data
        const response = await axios.post(`${API_URL}/add-item-to-inventory`, itemData);

        return response.data; // Return the saved item from the backend
    } catch (error) {
        console.error("Error adding item:", error);
        throw error;
    }
};

export const fetchInventoryItems = async () => {
    try {
        console.log("Fetching inventory items...");

        // Make the GET request using axios
        const response = await axios.get(`${API_URL}/get-inventory-items`);

        return response.data; // Return fetched inventory data
    } catch (error) {
        console.error("Error fetching inventory:", error);
        throw error;
    }
};

export const fetchSpareRequests = async () => {
    try {
        const response = await axios.get(`${API_URL}/get-spare-requests`);
        return response.data;
    } catch (error) {
        console.error("Error fetching spare requests:", error);
        throw error;
    }
};

export const updateSpareRequestStatus = async (ticketId, requestId, status, userId, technicianId) => {
    try {
        console.log(`Updating request ${requestId} to ${status} by user ${userId} ${technicianId}`);

        // Make the API request
        const response = await axios.post(`${API_URL}/update-spare-request-status`, {
            request_id: requestId,
            status: status,
            user_id: userId,
            ticket_id: ticketId,
            technician_id: technicianId
        });

        return response.data; // Return API response
    } catch (error) {
        console.error("Error updating request status:", error);
        throw error;
    }
};

export const updateTicketPriority = async (ticketId, priority, user_id, technician_id) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
            `${API_URL}/technician/tickets/${ticketId}/priority`,
            {
                priority,
                user_id,
                technician_id
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating ticket priority:", error);
        return { success: false, message: error.response?.data?.message || "Server error" };
    }
};
