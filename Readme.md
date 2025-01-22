# Computer Systems Complaint Tracking

## Overview
The **Computer Systems Complaint Tracking** project is developed for the **Test and Repair Centre (TRC)** department of an institution. The system aims to automate and streamline the repair request workflow, including repair tracking, technician assignments, parts management, and ticket status updates. This centralized platform reduces manual intervention, enhances efficiency, and improves communication among faculty, staff, and technicians.



## Features
- **Role-based Access**: Different user roles are supported, including **Admin**, **Technician**, and **Requester** (Faculty, Staff, or Student), each with specific permissions.
- **Repair Ticket Management**: Requesters (faculty, staff, or students) can submit, track, and view the status of repair tickets.
- **Technician Assignment**: Admins can assign and reassign tickets to technicians, who can log repair processes, parts used, and labor hours.
- **Parts and Inventory Management**: Technicians can request and manage parts required for repairs. The system tracks available inventory.
- **Feedback and Reporting**: Requesters can provide feedback upon ticket completion. Admins can generate detailed reports on requests, ticket statuses, technician performance, and parts usage.
- **Automated Notifications**: The system sends notifications for every key action, including ticket creation, technician assignment, and task completion.
- **Comprehensive Analytics**: The system generates various reports for decision-making and performance analysis.

## Functional Requirements

### 1. User Roles & Permissions:
- **Admin**: Oversee the entire system, assign and reassign tickets, manage technician performance, parts, and generate reports.
- **Technician**: View and manage repair tickets, request spare parts, log repairs, and update ticket statuses.
- **Requester**: Submit new repair requests, view the status of requests, and approve or provide feedback on completed repairs.

### 2. Repair Ticket Workflow:
- **Request Submission**: Requesters submit repair requests via a web portal or app, providing details such as the nature of the issue, system type, and urgency.
- **Ticket Categorization**: The system categorizes and prioritizes tickets based on the nature of the issue and urgency level. Admins can manually adjust categories.
- **Technician Assignment**: Admin assigns the ticket to a technician, who can view, update, and close the ticket.
- **Parts and Inventory**: Technicians request spare parts as needed. Admin approves part requests, and inventory is updated accordingly.
- **Completion and Feedback**: Once the repair is completed, requesters provide feedback. Admin closes the ticket and reviews feedback.

### 3. Notification and Communication:
- Automated notifications are sent at each stage of the process (e.g., when tickets are assigned, completed, or feedback is provided).
- Requesters and technicians can communicate through the portal to clarify details or request updates.

### 4. Reporting and Dashboards:
- **Performance Reports**: Admins can track technician performance, ticket completion timelines, and parts usage.
- **Customizable Reports**: Generate periodical reports for decision-making, showing the number of requests, statuses, and pending tickets.
- **System Health**: Track system health with reports on repairs, parts usage, and technician workload.

## ER Diagram

The **ER Diagram** of the system represents the entities involved and the relationships between them, including:
- **User**: Represents system users (Admin, Technician, Requester).
- **Repair_Ticket**: Merged entity for repair requests and tickets, storing details like ticket ID, issue description, urgency, technician assignment, status, and parts used.
- **Technician**: Represents technicians assigned to repair tickets.
- **Parts**: Stores information about the spare parts inventory.
- **Notification**: Manages automated alerts sent during the repair process.
- **Feedback**: Stores feedback provided by the requester on ticket completion.

## Workflow Summary

1. **Request Submission Flow**:
   - Requesters log in and submit repair requests.
   - Requests are categorized and displayed to admins.
   - Admin assigns the ticket to a technician.
   - The requester receives confirmation with a ticket number.

2. **Repair Process & Ticket Closing Flow**:
   - Technicians accept the assigned ticket and begin repairs.
   - Parts used and labor hours are recorded.
   - Admin approves parts requests.
   - Technician completes the repair and closes the ticket.
   - Requester reviews and closes the ticket with feedback.
   - Admin reviews the feedback and closes the ticket.

## Technologies Used
- **Backend**: Python (Flask)
- **Frontend**: React
- **Database**: MySQL for storing user, ticket, parts, and feedback data
- **Notifications**: Automated email notifications

## Installation and Setup


