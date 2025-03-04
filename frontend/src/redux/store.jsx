import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { alertSlice } from "./alertSlice";
import { userSlice } from "./userSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Defaults to localStorage
import notificationsReducer from "./notificationSlice";

// Configuration for redux-persist
const persistConfig = {
    key: "root",
    storage,
    whitelist: ["user"], // Persist only the user slice
};

// Combine reducers
const rootReducer = combineReducers({
    alerts: alertSlice.reducer,
    user: userSlice.reducer,
    notifications: notificationsReducer,  // This is enough, no need to add it again later
});

// Wrap the root reducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Disable warnings for non-serializable actions from redux-persist
        }),
});

// Create a persistor
const persistor = persistStore(store);

export { store, persistor };
