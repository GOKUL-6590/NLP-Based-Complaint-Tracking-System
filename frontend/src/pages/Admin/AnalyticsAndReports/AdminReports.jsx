import React, { useEffect, useState } from "react";
import { getAllTickets, getTechnicianPerformanceMetrics } from "../../../service/adminService";
import TicketTable from "../../../components/AdminReportsComponets/TicketTable";
import TechnicianMetricsTable from "../../../components/AdminReportsComponets/TechnicianMetricsTable";
import "./AdminReports.css"; // Import the updated CSS
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/alertSlice";



const AdminReports = () => {
    const [tickets, setTickets] = useState([]);
    const [technicianMetrics, setTechnicianMetrics] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [filteredTechnicianMetrics, setFilteredTechnicianMetrics] = useState([]);
    const [view, setView] = useState("tickets"); // Default to "tickets"
    const [filters, setFilters] = useState({
        status: "",
        priority: "",
        category: "",
        technician: "",
        period: "weekly", // default period
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [ticketsPerPage, setTicketsPerPage] = useState(10);

    const dispatch = useDispatch()

    useEffect(() => {
        fetchTickets();
        fetchTechnicianMetrics();
    }, []);

    useEffect(() => {
        // Filter tickets and technician metrics based on filters
        applyFilters();
    }, [filters, tickets, technicianMetrics]);

    const fetchTickets = async () => {
        try {
            dispatch(showLoading())
            const response = await getAllTickets();
            dispatch(hideLoading())
            if (response.success) {
                setTickets(response.tickets);
            } else {
                setTickets([]);
            }
        } catch (error) {
            dispatch(hideLoading())
            console.error("Error fetching tickets:", error);
        }
    };

    const fetchTechnicianMetrics = async () => {
        try {
            dispatch(showLoading())
            const response = await getTechnicianPerformanceMetrics();
            dispatch(hideLoading())
            if (response.success) {
                setTechnicianMetrics(response.technicians);
            } else {
                setTechnicianMetrics([]);
            }
        } catch (error) {
            dispatch(hideLoading())
            console.error("Error fetching technician metrics:", error);
        }
    };

    // Apply filters to tickets and technician metrics
    const applyFilters = () => {
        let filteredTicketsData = tickets;
        let filteredTechnicianData = technicianMetrics;

        // Apply filters for tickets
        if (filters.status) {
            filteredTicketsData = filteredTicketsData.filter(ticket => ticket.status.toLowerCase() === filters.status.toLowerCase());
        }
        if (filters.priority) {
            filteredTicketsData = filteredTicketsData.filter(ticket => ticket.priority.toLowerCase() === filters.priority.toLowerCase());
        }
        if (filters.category) {
            filteredTicketsData = filteredTicketsData.filter(ticket => ticket.category.toLowerCase().includes(filters.category.toLowerCase()));
        }

        // Apply filters for technician metrics
        if (filters.technician) {
            filteredTechnicianData = filteredTechnicianData.filter(technician =>
                technician.technician_name.toLowerCase().includes(filters.technician.toLowerCase())
            );
        }

        setFilteredTickets([...filteredTicketsData]);  // Force state update
        setFilteredTechnicianMetrics([...filteredTechnicianData]);  // Force state update
    };


    // Handle Filter Change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    // Handle CSV export
    // Handle CSV export
    const exportCSV = (data, fileName) => {
        if (!data.length) {
            alert("No data available to export.");
            return;
        }

        let csvData;
        if (view === "tickets") {
            csvData = [
                ["Ticket ID", "System No.", "Venue", "Block", "Category", "Priority", "Status", "Created At", "Last Updated", "User Name", "Technician Name"],
                ...data.map(item => [
                    item.ticket_id || item.id,
                    item.system_number,
                    item.venue,
                    item.block,
                    item.category,
                    item.priority,
                    item.status,
                    item.created_at,
                    item.last_updated,
                    item.user_name || "N/A",
                    item.technician_name || "N/A"
                ])
            ];
        } else {
            csvData = [
                ["Technician Name", "Total Assigned Tickets", "Total Resolved Tickets", "Today Assigned Tickets", "Today Resolved Tickets", "SLA Breached", "Last Updated"],
                ...data.map(item => [
                    item.technician_name,
                    item.total_assigned_tickets,
                    item.total_resolved_tickets,
                    item.today_assigned_tickets,
                    item.today_resolved_tickets,
                    item.sla_breached_slot,
                    item.last_updated
                ])
            ];
        }

        const csvContent = "data:text/csv;charset=utf-8," + csvData.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = `${fileName}.csv`;
        document.body.appendChild(link);
        link.click();
    };


    // Pagination Logic for Tickets
    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="admin-reports-container">
            <h2>Analytics & Reports</h2>

            <div className="admin-reports-dropdown">
                <label htmlFor="report-view">Select Report Type:</label>
                <select id="report-view" onChange={(e) => setView(e.target.value)} value={view}>
                    <option value="tickets">Tickets</option>
                    <option value="technician_metrics">Technician Metrics</option>
                </select>
            </div>

            {/* Filters Section */}
            {/* Filters Section */}
            <div className="admin-reports-filters">
                {view === "tickets" ? (
                    <>
                        <label>Status:</label>
                        <select name="status" onChange={handleFilterChange}>
                            <option value="">All</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                        </select>

                        <label>Priority:</label>
                        <select name="priority" onChange={handleFilterChange}>
                            <option value="">All</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>

                        <label>Category:</label>
                        <input type="text" name="category" onChange={handleFilterChange} placeholder="Enter category" />

                        <label>Period:</label>
                        <select name="period" onChange={handleFilterChange}>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="custom">Custom</option>
                        </select>
                    </>
                ) : (
                    <>
                        <label>Technician Name:</label>
                        <input type="text" name="technician" onChange={handleFilterChange} placeholder="Enter technician name" />
                    </>
                )}

                <button onClick={() => exportCSV(view === "tickets" ? filteredTickets : filteredTechnicianMetrics, `${view}_report`)}>
                    Export CSV
                </button>
            </div>


            {/* Render Tickets or Technician Metrics based on selected view */}
            {view === "tickets" ? (
                <TicketTable
                    tickets={currentTickets}
                    paginate={paginate}
                    currentPage={currentPage}
                    ticketsPerPage={ticketsPerPage}
                    totalTickets={filteredTickets.length}
                />
            ) : (
                <TechnicianMetricsTable technicianMetrics={filteredTechnicianMetrics} />
            )}
        </div>
    );
};

export default AdminReports;

