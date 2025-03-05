import React, { useState, useEffect } from "react";
import "./Inventory.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addItemToInventory,
  fetchInventoryItems,
  fetchSpareRequests,
  updateSpareRequestStatus,
} from "../../../service/adminService";
import toast from "react-hot-toast";
import { FaCheck, FaTimes } from "react-icons/fa";
import { hideLoading, showLoading } from "../../../redux/alertSlice";
import socket from "../../../components/socket";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isInitialLoad, setIsInitialLoad] = useState(true); // For load transition

  useEffect(() => {
    const loadInventoryAndRequests = async () => {
      try {
        dispatch(showLoading());
        const [inventoryData, requestData] = await Promise.all([
          fetchInventoryItems(),
          fetchSpareRequests(),
        ]);
        dispatch(hideLoading());

        setItems(inventoryData.inventory_items);
        setRequests(requestData.spare_requests); // Assuming API returns { spare_requests: [...] }
        setTimeout(() => setIsInitialLoad(false), 1000); // End animation after 1s
      } catch (error) {
        dispatch(hideLoading());
        console.error("Error loading data:", error);
        setTimeout(() => setIsInitialLoad(false), 1000); // Ensure animation ends even on error
      }
    };

    loadInventoryAndRequests();
  }, [dispatch]);

  const [newItem, setNewItem] = useState({
    item_name: "",
    description: "",
    quantity: "",
    added_by: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.item_name.trim() || newItem.quantity <= 0) return;

    const newItemObj = {
      item_name: newItem.item_name,
      description: newItem.description,
      quantity: parseInt(newItem.quantity, 10),
      added_by: user.id,
      added_by_name: user.name || "Admin",
      id: Date.now(),
    };

    try {
      dispatch(showLoading());
      const response = await addItemToInventory({
        name: newItem.item_name,
        description: newItem.description,
        quantity: parseInt(newItem.quantity, 10),
        added_by: user.id,
      });
      dispatch(hideLoading());

      if (response.success) {
        toast.success(response.message);
        const addedItem = response.data?.item || newItemObj;
        setItems((prevItems) => [...prevItems, {
          ...addedItem,
          item_name: addedItem.name || addedItem.item_name,
          added_by_name: user.name || "Admin",
        }]);
        setNewItem({ item_name: "", description: "", quantity: "", added_by: "" });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Failed to save item. Please try again.");
    }
  };

  const handleRequestAction = async (ticket_id, requestIds, status, technician_id) => {
    try {
      const requestIdsArray = Array.isArray(requestIds) ? requestIds : [requestIds];
      dispatch(showLoading());
      const response = await updateSpareRequestStatus(ticket_id, requestIdsArray, status, user.id, technician_id);
      dispatch(hideLoading());
      if (response.success) {
        toast.success(`Request ${status} successfully`);
        socket.emit("unread-notifications", technician_id);
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            requestIdsArray.includes(req.request_id) ? { ...req, approval_status: status } : req
          )
        );
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(`Failed to ${status} request:`, error);
      toast.error(`Failed to ${status} request`);
    }
  };

  const groupRequestsByTicket = (requests) => {
    const grouped = {};

    requests.forEach((req) => {
      if (!grouped[req.ticket_id]) {
        grouped[req.ticket_id] = {
          ticket_id: req.ticket_id,
          technician_name: req.technician_name,
          technician_id: req.technician_id,
          approval_status: req.approval_status,
          requested_at: req.requested_at,
          items: [],
        };
      }

      grouped[req.ticket_id].items.push({
        name: req.items,
        part_id: req.part_ids,
        quantity: req.quantities,
        request_id: req.request_ids,
      });
    });

    return Object.values(grouped);
  };

  return (
    <div className={`inventory-container ${isInitialLoad ? "animate-on-load" : ""}`}>
      <h2>Inventory Management</h2>

      <div className="inventory-grid">
        <div className="inventory-list">
          <h2>Available Items</h2>
          {items.length > 0 ? (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Added By</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item_name}</td>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.added_by_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data"> Not Available</p>
          )}
        </div>

        <div className="right-column">
          <div className="technician-requests">
            <h2>Technician Requests</h2>
            {requests.length > 0 ? (
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Technician</th>
                    <th>Items</th>
                    <th>Requested At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupRequestsByTicket(requests).map((group) => (
                    <tr key={group.ticket_id}>
                      <td>{group.ticket_id}</td>
                      <td>{group.technician_name}</td>
                      <td>
                        <ul>
                          {group.items.map((item, index) => (
                            <li key={index}>
                              {item.name} (Qty: {item.quantity})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>{new Date(group.requested_at).toLocaleString()}</td>
                      <td>{group.approval_status}</td>
                      <td>
                        {group.approval_status === "Pending" ? (
                          <>
                            <button
                              className="accept-btn"
                              onClick={() =>
                                handleRequestAction(
                                  group.ticket_id,
                                  group.items.map((i) => i.request_id),
                                  "Approved",
                                  group.technician_id
                                )
                              }
                            >
                              <FaCheck />
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() =>
                                handleRequestAction(
                                  group.ticket_id,
                                  group.items.map((i) => i.request_id),
                                  "Rejected",
                                  group.technician_id
                                )
                              }
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <span>{group.approval_status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-requests">
                <p className="no-data"> No Requests</p>
              </div>
            )}
          </div>

          <div className="inventory-form">
            <h2>Add New Item</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="item_name"
                placeholder="Item Name"
                value={newItem.item_name}
                onChange={handleChange}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={newItem.description}
                onChange={handleChange}
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={handleChange}
                min="1"
                required
              />
              <button type="submit">Add Item</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;