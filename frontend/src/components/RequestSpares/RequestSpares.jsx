import React, { useState, useEffect } from "react";
import { getInventory, requestSpares } from "../../service/TechnicianService";
import "./RequestSpares.css";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { hideLoading, showLoading } from "../../redux/alertSlice";
import socket from "../socket";

const RequestSparesModal = ({ ticketId, technicianId, onClose }) => {
    const [inventory, setInventory] = useState([]); // Available spares
    const [cart, setCart] = useState([]); // Selected items
    const { user } = useSelector((state) => state.user)
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                dispatch(showLoading())
                const response = await getInventory();
                dispatch(hideLoading())
                if (response.success) {
                    setInventory(response.inventory); // Extract inventory from response
                } else {
                    console.error("Error fetching inventory:", response.message);
                }
            } catch (error) {
                dispatch(hideLoading())
                console.error("Failed to fetch inventory", error);
            }
        };

        fetchInventory();
    }, []);

    const addToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            const inventoryItem = inventory.find(invItem => invItem.id === item.id);

            if (existingItem) {
                if (existingItem.quantity < inventoryItem.quantity) {
                    return prevCart.map(cartItem =>
                        cartItem.id === item.id
                            ? { ...cartItem, quantity: cartItem.quantity + 1 }
                            : cartItem
                    );
                } else {
                    toast.error("Cannot add more than available stock!");
                    return prevCart;
                }
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prevCart => {
            return prevCart
                .map(cartItem =>
                    cartItem.id === itemId
                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                        : cartItem
                )
                .filter(cartItem => cartItem.quantity > 0);
        });
    };

    const handleSubmitRequest = async () => {
        if (cart.length === 0) {
            toast.error("No items selected for request!");
            return;
        }

        try {
            const requestData = {
                ticketId,
                technicianId: user.id,
                items: cart.map(item => ({
                    itemId: item.id,
                    itemName: item.item_name,
                    quantity: item.quantity
                }))
            };
            dispatch(showLoading())
            const response = await requestSpares(requestData);
            dispatch(hideLoading())
            if (response.success) {
                socket.emit("unread-notifications", 5); // Emit update

                toast.success("Spares requested successfully!");
                onClose();
            } else {
                toast.error("Error in submitting the request")
            }

        } catch (error) {
            dispatch(hideLoading())
            console.error("Error requesting spares:", error);
            toast.error("Failed to request spares.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>X</button>
                <h3>Request Spares</h3>

                <h4>Available Items</h4>
                <div className="list-container">
                    <ul>
                        {inventory.map(item => (
                            <li key={item.id}>
                                {item.item_name} ({item.quantity} available)
                                <button onClick={() => addToCart(item)}>Add</button>
                            </li>
                        ))}
                    </ul>
                </div>

                <h4>Selected Items</h4>
                <div className="list-container">
                    <ul>
                        {cart.map(item => (
                            <li key={item.id}>
                                {item.item_name} (x{item.quantity})
                                <button onClick={() => removeFromCart(item.id)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>

                <button className="action-button" onClick={handleSubmitRequest}>Submit Request</button>
            </div>
        </div>
    );
};

export default RequestSparesModal;
