import React, { useState, useEffect } from "react";
import {
    getUnapprovedTechnicians,
    getApprovedTechnicians,
    sendTechnicianApprovalRejection,
    getAllUsers
} from "../../../service/adminService";

import "./Manageusers.css"
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/alertSlice";

const ManageUsers = () => {
    const [unapprovedTechnicians, setUnapprovedTechnicians] = useState([]);
    const [approvedTechnicians, setApprovedTechnicians] = useState([]);
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState(0);
    const dispatch = useDispatch()

    // Handle technician approval
    const approveTechnician = async (technicianId) => {
        try {
            dispatch(showLoading())
            const response = await sendTechnicianApprovalRejection(technicianId, "approve");
            dispatch(hideLoading())
            if (response.data.success) {
                const technicianToApprove = unapprovedTechnicians.find((tech) => tech.id === technicianId);

                setUnapprovedTechnicians((prev) =>
                    prev.filter((tech) => tech.id !== technicianId)
                );
                setApprovedTechnicians((prev) => [...prev, technicianToApprove]);

                setNotifications((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            dispatch(hideLoading())
            console.error("Error approving technician:", error);
        }
    };

    // Handle technician rejection
    const rejectTechnician = async (technicianId) => {
        try {
            dispatch(showLoading())
            const response = await sendTechnicianApprovalRejection(technicianId, "reject");
            dispatch(hideLoading())
            if (response.data.success) {
                setUnapprovedTechnicians((prev) =>
                    prev.filter((tech) => tech.id !== technicianId)
                );

                setNotifications((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            dispatch(hideLoading())
            console.error("Error rejecting technician:", error);
        }
    };

    // Fetch unapproved and approved technicians
    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                // Fetch unapproved technicians
                dispatch(showLoading())
                const unapprovedResponse = await getUnapprovedTechnicians();
                dispatch(hideLoading())
                setUnapprovedTechnicians(unapprovedResponse.technicians || []);
                setNotifications(unapprovedResponse.technicians?.length || 0);

                // Fetch approved technicians
                dispatch(hideLoading())
                const approvedResponse = await getApprovedTechnicians();
                dispatch(hideLoading())
                console.log(approvedResponse)
                setApprovedTechnicians(approvedResponse.technicians || []);
            } catch (error) {
                dispatch(hideLoading())
                console.error("Error fetching technicians:", error);
            }
        };
        fetchTechnicians();
    }, []);



    useEffect(() => {
        const fetchUsers = async () => {
            try {
                dispatch(showLoading())
                const userResponse = await getAllUsers();
                dispatch(hideLoading())
                setUsers(userResponse.users || []);
            } catch (error) {
                dispatch(hideLoading())
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="manage-users-container">
            
            <div className="column-container">

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
                                    <div key={technician.id} className="technician-card">
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
                        <ul>
                            {users.map((user) => (
                                <li key={user.id}>
                                    {user.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
