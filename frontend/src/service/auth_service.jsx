// src/services/authService.js
import axios from 'axios';
import { setUser } from "../redux/userSlice";


const API_URL = 'http://127.0.0.1:5000/api/auth';

export const registerUser = async (userData) => {
    try {
        console.log(userData + "authservice")
        const response = await axios.post(`${API_URL}/register`, userData);

        return response.data;
    } catch (error) {
        console.error('Error during registration:', error.response?.data || error.message);
        throw error;
    }
};

export const loginUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/login`, userData);
        console.log(response + " in authservice");


        return response.data;
    } catch (error) {
        console.error('Error during login:', error.response?.data || error.message);

        // Handle error messages and status codes from the backend
        if (error.response) {
            // Check for specific error message from the backend
            throw new Error(error.response.data.message || 'Login failed. Please try again.');
        } else {
            throw new Error('Network or server error occurred.');
        }
    }
};
