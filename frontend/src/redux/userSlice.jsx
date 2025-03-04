import { createSlice } from "@reduxjs/toolkit";

// userSlice.js
export const userSlice = createSlice({
    name: "user",
    initialState: {
        id: null,  // Initialize user id as null
        user: null, // Other user details (if any)
    },
    reducers: {
        setUser: (state, action) => {
            state.id = action.payload.id; // Store the id from the payload
            state.user = action.payload;   // Optionally store the full user object
        },
    },
});

export const { setUser } = userSlice.actions;

