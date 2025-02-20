// store/notificationsSlice.js
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const notificationsSlice = createSlice({
    name: "notifications",
    initialState: {
        list: [],
        unreadCount: 0,
    },
    reducers: {
        setNotifications: (state, action) => {
            state.list = action.payload;
            state.unreadCount = action.payload.filter(n => !n.is_read).length;
        },
        markAsRead: (state, action) => {
            state.list = state.list.map(n =>
                n.id === action.payload ? { ...n, is_read: true } : n
            );
            state.unreadCount = state.list.filter(n => !n.is_read).length;
        },
        markAllAsRead: (state) => {
            state.list = state.list.map(n => ({ ...n, is_read: true }));
            state.unreadCount = 0;
        },
        deleteAllNotifications: (state) => {
            state.list = [];
            state.unreadCount = 0;
        }
    }
});

export const { setNotifications, markAsRead, markAllAsRead, deleteAllNotifications } = notificationsSlice.actions;

// export const fetchNotifications = (userId) => async (dispatch) => {
//     try {
//         const response = await axios.get("http://localhost:5000/users/notifications", {
//             params: { receiver_id: userId }
//         });
//         dispatch(setNotifications(response.data.notifications));
//     } catch (error) {
//         console.error("Error fetching notifications:", error);
//     }
// };

export default notificationsSlice.reducer;
