from flask import Blueprint, request, jsonify
from mysql.connector import connect

from backend.Sockets.socket import emit_ticket_assigned
from backend.models.admin import add_item_to_inventory_model, assign_ticket_to_technician_by_admin, fetch_dashboard_metrics, get_all_inventory_items_from_db, get_all_spare_requests_from_db, get_all_technician_metrics_from_db, get_all_tickets, get_all_users_from_db, get_assigned_tickets_from_db, get_available_technicians_from_db, get_unassigned_tickets_from_db, update_spare_request_status_model, update_ticket_priority_in_db
from backend.routes.user_routes import get_ticket_details

from ..models.notifications import approve_or_reject_technician, send_notification
from ..models.technician import fetch_approved_technicians_from_db, fetch_unapproved_technicians_from_db, update_technician_approval_status


def process_technician_approval_rejection(technician_id, action):
    try:
        # Call the model to approve or reject the technician
        success = approve_or_reject_technician(technician_id, action)
        
        if success:
            # Prepare the notification message
            action_message = "approved" if action == "approve" else "rejected"
            notification_message = f"Your account has been {action_message} by the administrator."

            # Set link_url based on action
            link_url = "/technician/dashboard" if action == "approve" else "/home"

            # Call the notification function
            send_notification(
                sender_id=1,  # Assuming 1 is the admin/system user
                receiver_id=technician_id,
                sender_name="Admin",
                message=notification_message,
                notification_type="technician_status",
                link_url=link_url  # Add this parameter
            )
            return jsonify({
                "message": f"Technician {action}d successfully.",
                "success": True
            }), 200
        else:
            return jsonify({
                "message": "Failed to process technician approval/rejection.",
                "success": False
            }), 500

    except Exception as e:
        print(f"Error processing technician approval/rejection: {str(e)}")
        return jsonify({
            "message": "An unexpected error occurred. Please try again later.",
            "success": False,
            "error": str(e)
        }), 500



def get_unapproved_technicians():
    """
    Fetch the list of unapproved technicians from the database.
    """
    try:
        # Fetch unapproved technicians from the model
        technicians = fetch_unapproved_technicians_from_db()
        
        # Success response with the list of technicians
        return jsonify({
            'message': 'Fetched unapproved technicians successfully.',
            'technicians': technicians,
            'success': True
        }), 200

    except Exception as e:
        # Log the error and send an error response
        print(f"Error fetching unapproved technicians: {str(e)}")
        return jsonify({
            'message': 'An unexpected error occurred. Please try again later.',
            'success': False,
            'error': str(e)
        }), 500


def get_approved_technicians():
    """
    Fetch the list of unapproved technicians from the database.
    """
    try:
        # Fetch unapproved technicians from the model
        technicians = fetch_approved_technicians_from_db()
        
        # Success response with the list of technicians
        return jsonify({
            'message': 'Fetched approved technicians successfully.',
            'technicians': technicians,
            'success': True
        }), 200

    except Exception as e:
        # Log the error and send an error response
        print(f"Error fetching approved technicians: {str(e)}")
        return jsonify({
            'message': 'An unexpected error occurred. Please try again later.',
            'success': False,
            'error': str(e)
        }), 500


def fetch_all_users():
    try:
        users= get_all_users_from_db()
        return jsonify({
            "success": True,
            "users": users,
            'message':"users fetched Successfully"
        }), 200
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({
            "success": False,
            "message": "Error fetching users",
            "error": str(e)
        }), 500
    
def get_dashboard_data():
    try:
        dashboard_data = fetch_dashboard_metrics()
        return jsonify({
            "success": True,
            "totalUsers": dashboard_data.get("total_users", 0),
            "openTickets": dashboard_data.get("open_tickets", 0),
            "resolvedTickets": dashboard_data.get("resolved_tickets", 0),
            "pendingTickets": dashboard_data.get("pending_tickets", 0),
            "chartData": dashboard_data.get("chart_data", []),  # Include chart_data
            "message": "Dashboard data fetched successfully"
        }), 200
    except Exception as e:
        print(f"Error fetching dashboard data: {e}")
        return jsonify({
            "success": False,
            "message": "Error fetching dashboard data",
            "error": str(e)
        }), 500


def get_assigned_tickets():
    try:
        # Attempt to fetch the assigned tickets
        tickets = get_assigned_tickets_from_db()
        return jsonify({
            "success": True,
            "tickets": tickets,
            "message": "Assigned tickets fetched successfully"
        }), 200
    except Exception as e:
        # If an error occurs, log it and return a failure response
        print(f"Error fetching assigned tickets: {e}")
        return jsonify({
            "success": False,
            "message": "Error fetching assigned tickets",
            "error": str(e)
        }), 500

def get_unassigned_tickets():
    try:
        # Attempt to fetch the unassigned tickets
        tickets = get_unassigned_tickets_from_db()
        return jsonify({
            "success": True,
            "tickets": tickets,
            "message": "Unassigned tickets fetched successfully"
        }), 200
    except Exception as e:
        # If an error occurs, log it and return a failure response
        print(f"Error fetching unassigned tickets: {e}")
        return jsonify({
            "success": False,
            "message": "Error fetching unassigned tickets",
            "error": str(e)
        }), 500


def get_available_technicians():
    try:
        # Attempt to fetch available technicians
        technicians = get_available_technicians_from_db()
        return jsonify({
            "success": True,
            "technicians": technicians,
            "message": "Available technicians fetched successfully"
        }), 200
    except Exception as e:
        # If an error occurs, log it and return a failure response
        print(f"Error fetching available technicians: {e}")
        return jsonify({
            "success": False,
            "message": "Error fetching available technicians",
            "error": str(e)
        }), 500
    

def assign_ticket_controller(ticket_id, technician_id, assign_type):
    try:
        # Attempt to assign the technician to the ticket
        result = assign_ticket_to_technician_by_admin(ticket_id, technician_id, assign_type)

        if result:
        # Return a success response if assignment is successful

            return jsonify({
                "success": True,
                "message": "Ticket assigned successfully",
                "result": result
            }), 200
        return jsonify({
                "success": False,
                "message": "Ticket not assigned successfully",
                "result": result
            }), 200

    except Exception as e:
        # If an error occurs, log it and return a failure response
        print(f"Error assigning ticket: {e}")
        return jsonify({
            "success": False,
            "message": "Error assigning ticket",
            "error": str(e)
        }), 500

def get_all_tickets_for_admin():
    try:
        tickets = get_all_tickets()

        return jsonify({
            "success": True,
            "tickets": tickets,
            "message": "Assigned tickets fetched successfully"
        }), 200
    except Exception as e:
        print(f"Error fetching assigned tickets: {e}")
        return jsonify({
            "success": False,
            "message": "Error fetching assigned tickets",
            "error": str(e)
        }), 500
    
def get_all_technician_metrics_for_admin():
    try:
        technicians = get_all_technician_metrics_from_db()

        return jsonify({
            "success": True,
            "technicians": technicians,
            "message": "Assigned tickets fetched successfully"
        }), 200
    except Exception as e:
        print(f"Error fetching assigned tickets: {e}")
        return jsonify({
            "success": False,
            "message": "Error fetching assigned tickets",
            "error": str(e)
        }), 500

def add_item_to_inventory_controller(item_data):
    try:
        # Call the model function to add the item
        result = add_item_to_inventory_model(item_data)

        if result:
            return jsonify({
                "success": True,
                "message": "Item added successfully",
                "result": result
            }), 200

        return jsonify({
            "success": False,
            "message": "Failed to add item",
            "result": result
        }), 200

    except Exception as e:
        print(f"Error adding item to inventory: {e}")
        return jsonify({
            "success": False,
            "message": "Error adding item to inventory",
            "error": str(e)
        }), 500

def get_inventory_items():
    try:
        inventory_items = get_all_inventory_items_from_db()

        return jsonify({
            "success": True,
            "inventory_items": inventory_items,
            "message": "Inventory items fetched successfully"
        }), 200
    except Exception as e:
        print(f"Error fetching inventory items: {e}")
        return jsonify({
            "success": False,
            "message": "Error fetching inventory items",
            "error": str(e)
        }), 500

def get_spare_requests():
    try:
        spare_requests = get_all_spare_requests_from_db()  # Call the model function

        return jsonify({
            "success": True,
            "spare_requests": spare_requests,
            "message": "Spare requests fetched successfully"
        }), 200
    except Exception as e:
        print(f"Error fetching spare requests: {e}")
        return jsonify({
            "success": False,
            "message": "Error fetching spare requests",
            "error": str(e)
        }), 500

def update_spare_request_status_controller(request_id, status, user_id, ticket_id, technician_id):
    try:
        # Update the request status in the database
        result = update_spare_request_status_model(request_id, status, user_id, ticket_id)

        if result:
            # Construct the notification message
            notification_message = f"Your spare request (Ticket ID: {ticket_id}) has been {status}."

            # Set link_url to the specific ticket details page
            link_url = f"/ticket/{ticket_id}"
            # Send notification to the technician
            send_notification(
                sender_id=user_id,
                receiver_id=technician_id,
                sender_name="Admin",
                message=notification_message,
                notification_type="spares_request",
                link_url=link_url  # Add this parameter
            )

            return jsonify({
                "success": True,
                "message": "Request status updated successfully and technician notified",
                "result": result
            }), 200

        return jsonify({
            "success": False,
            "message": "Failed to update request status",
            "result": result
        }), 200

    except Exception as e:
        print(f"Error updating request status: {e}")
        return jsonify({
            "success": False,
            "message": "Error updating request status",
            "error": str(e)
        }), 500

def process_ticket_priority_update(ticket_id, priority, user_id,technician_id):
    try:
        # Call the model to update the ticket priority in the database
        success = update_ticket_priority_in_db(ticket_id, priority, user_id)

        if success:
            # Prepare the notification message
            notification_message = f"The priority of ticket {ticket_id} has been changed to {priority} by the administrator."

           
           

            # Set link_url for the notification
            link_url = f"/ticket/{ticket_id}"

            # Send notification to the ticket's user
            send_notification(
                sender_id=1,  # Admin who made the change
                receiver_id=user_id,
                sender_name="Admin",
                message=notification_message,
                notification_type="priority_update",
                link_url=link_url
            )

            # Optionally notify the technician if assigned
            if technician_id:
                send_notification(
                    sender_id=1,
                    receiver_id=technician_id,
                    sender_name="Admin",
                    message=notification_message,
                    notification_type="priority_update",
                    link_url=link_url
                )

            return jsonify({
                "message": f"Ticket priority updated to {priority} successfully.",
                "success": True
            }), 200
        else:
            return jsonify({
                "message": "Failed to update ticket priority.",
                "success": False
            }), 500

    except Exception as e:
        print(f"Error processing ticket priority update: {str(e)}")
        return jsonify({
            "message": "An unexpected error occurred. Please try again later.",
            "success": False,
            "error": str(e)
        }), 500
    
    