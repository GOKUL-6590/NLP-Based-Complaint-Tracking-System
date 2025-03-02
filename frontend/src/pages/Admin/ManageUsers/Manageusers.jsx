import React, { useState, useEffect } from "react";
import "./ManageUsers.css";
import {
    getUnapprovedTechnicians,
    getApprovedTechnicians,
    sendTechnicianApprovalRejection,
    getAllUsers
} from "../../../service/adminService";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/alertSlice";
import TechnicianModal from "../../../components/TechnicianCard/TechnicianCard";
import { FaClock } from "react-icons/fa";


const ManageUsers = () => {
    const [unapprovedTechnicians, setUnapprovedTechnicians] = useState([]);
    const [approvedTechnicians, setApprovedTechnicians] = useState([]);
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true); // For load transitions
    const [selectedTechnician, setSelectedTechnician] = useState(null); // For modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch();

    // Handle technician approval
    const approveTechnician = async (technicianId) => {
        try {
            dispatch(showLoading());
            const response = await sendTechnicianApprovalRejection(technicianId, "approve");
            dispatch(hideLoading());
            if (response.data.success) {
                const technicianToApprove = unapprovedTechnicians.find((tech) => tech.id === technicianId);
                setUnapprovedTechnicians((prev) => prev.filter((tech) => tech.id !== technicianId));
                setApprovedTechnicians((prev) => [...prev, technicianToApprove]);
                setNotifications((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            dispatch(hideLoading());
            console.error("Error approving technician:", error);
        }
    };

    // Handle technician rejection
    const rejectTechnician = async (technicianId) => {
        try {
            dispatch(showLoading());
            const response = await sendTechnicianApprovalRejection(technicianId, "reject");
            dispatch(hideLoading());
            if (response.data.success) {
                setUnapprovedTechnicians((prev) => prev.filter((tech) => tech.id !== technicianId));
                setNotifications((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            dispatch(hideLoading());
            console.error("Error rejecting technician:", error);
        }
    };

    // Open modal for technician details
    const openModal = (technician) => {
        setSelectedTechnician(technician);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedTechnician(null);
        setIsModalOpen(false);
    };

    // Fetch data
    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                dispatch(showLoading());
                const unapprovedResponse = await getUnapprovedTechnicians();
                setUnapprovedTechnicians(unapprovedResponse.technicians || []);
                setNotifications(unapprovedResponse.technicians?.length || 0);

                const approvedResponse = await getApprovedTechnicians();
                console.log(approvedResponse);
                setApprovedTechnicians(approvedResponse.technicians || []);

                const userResponse = await getAllUsers();
                setUsers(userResponse.users || []);

                dispatch(hideLoading());
            } catch (error) {
                dispatch(hideLoading());
                console.error("Error fetching data:", error);
            }
            setTimeout(() => setIsInitialLoad(false), 1000); // End animations
        };
        fetchTechnicians();
    }, [dispatch]);

    const getInitials = (name) => {
        const words = name.split(" ");
        return words.length > 1
            ? `${words[0][0]}${words[1][0]}`
            : words[0].slice(0, 2).toUpperCase();
    };

    return (
        <div className="manage-users-container">
            <div className={`column-container ${isInitialLoad ? "animate-on-load" : ""}`}>
                <div className="first-column">
                    <div className="first-row">
                        <h2>Technician Approval</h2>
                        {unapprovedTechnicians.length === 0 ? (
                            <p>No unapproved technicians</p>
                        ) : (
                            unapprovedTechnicians.map((technician) => (
                                <div key={technician.id} className="technician-item">
                                    <span>{technician.name}</span>
                                    <button
                                        className="approve-btn"
                                        onClick={() => approveTechnician(technician.id)}
                                    >
                                        ✅ Approve
                                    </button>
                                    <button
                                        className="reject-btn"
                                        onClick={() => rejectTechnician(technician.id)}
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="second-row">
                        <h2>Technician Dictionary</h2>
                        <div className="technician-cards-container">
                            {approvedTechnicians.length > 0 ? (
                                approvedTechnicians.map((technician) => (
                                    <div
                                        key={technician.id}
                                        className="technician-card"
                                        onClick={() => openModal(technician)}                                    >
                                        <div className="profile-placeholder">
                                            {technician.profile_picture ? (
                                                <img
                                                    src={technician.profile_picture}
                                                    alt={technician.name}
                                                    className="profile-pic"
                                                />
                                            ) : (
                                                <span>{getInitials(technician.name)}</span>
                                            )}
                                        </div>
                                        <FaClock className="clock-icon" />
                                        <div className="technician-name">{technician.name}</div>
                                        <div className="technician-role">{technician.role}</div>
                                    </div>
                                ))
                            ) : (
                                <p>No approved technicians yet</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="second-column">
                    <h2>All Users</h2>
                    {users.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email || "N/A"}</td>
                                        <td>{user.role || "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {isModalOpen && <TechnicianModal technician={selectedTechnician} onClose={closeModal} />}
        </div>
    );
};

export default ManageUsers;