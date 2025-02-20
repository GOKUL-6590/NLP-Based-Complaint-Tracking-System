import React from "react";

const TechnicianMetricsTable = ({ technicianMetrics }) => {
    return (
        <div className="admin-reports-table-wrapper">
            {/* Table View for Desktop */}
            <table className="admin-reports-tickets-table">
                <thead>
                    <tr>
                        <th>Technician Name</th>
                        <th>Total Assigned Tickets</th>
                        <th>Total Resolved Tickets</th>
                        <th>Today Assigned Tickets</th>
                        <th>Today Resolved Tickets</th>
                        <th>SLA Breached</th>
                        <th>Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {technicianMetrics.length > 0 ? (
                        technicianMetrics.map((technician) => (
                            <tr key={technician.technician_id}>
                                <td>{technician.technician_name}</td>
                                <td>{technician.total_assigned_tickets}</td>
                                <td>{technician.total_resolved_tickets}</td>
                                <td>{technician.today_assigned_tickets}</td>
                                <td>{technician.today_resolved_tickets}</td>
                                <td>{technician.sla_breached_slot}</td>
                                <td>{technician.last_updated}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: "center" }}>No technician data found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Card View for Mobile */}
            {technicianMetrics.length > 0 ? (
                technicianMetrics.map((technician) => (
                    <div className="admin-reports-card" key={technician.technician_id}>
                        <div><strong>Technician Name:</strong> {technician.technician_name}</div>
                        <div><strong>Total Assigned Tickets:</strong> {technician.total_assigned_tickets}</div>
                        <div><strong>Total Resolved Tickets:</strong> {technician.total_resolved_tickets}</div>
                        <div><strong>Today Assigned Tickets:</strong> {technician.today_assigned_tickets}</div>
                        <div><strong>Today Resolved Tickets:</strong> {technician.today_resolved_tickets}</div>
                        <div><strong>SLA Breached:</strong> {technician.sla_breached_slot}</div>
                        <div><strong>Last Updated:</strong> {technician.last_updated}</div>
                    </div>
                ))
            ) : (
                <div className="admin-reports-card">
                    <div style={{ textAlign: "center" }}>No technician data found</div>
                </div>
            )}
        </div>
    );
};

export default TechnicianMetricsTable;
