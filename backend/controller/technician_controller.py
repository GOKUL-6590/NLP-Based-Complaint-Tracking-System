from flask import jsonify

from backend.models.notifications import send_notification
from backend.models.technician import close_ticket_in_db, fetch_all_inventory_from_db, fetch_all_tickets_from_db, fetch_assigned_tickets_from_db, fetch_requested_spares_from_db, fetch_technician_stats, save_spares_request,  update_ticket_status_in_db

def get_technician_stats(technician_id):
    try:
        stats, chart_data = fetch_technician_stats(technician_id)

        return jsonify({
            "success": True,
            "stats": stats,
            "chartData": chart_data,
            "message": "Technician stats fetched successfully"
        }), 200
    except Exception as e:
        print(f"Error fetching technician stats: {e}")
        return jsonify({
            "success": False,
            "message": "Error fetching technician stats",
            "error": str(e)
        }), 500



def get_assigned_tickets(tech_id):
    try:
        tickets = fetch_assigned_tickets_from_db(tech_id)

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
    


def update_ticket_status(ticket_id, status,technician_id,user_id):
    try:
        # Call the model to update the ticket status in the database
        result = update_ticket_status_in_db(ticket_id, status)

        if result:
            notification_message = f"Your ticket #{ticket_id} is now in progress. Our technician is working on it.If technician is not in Location please dispute the process"

            link_url = f"/ticket/{ticket_id}"

            send_notification(
                sender_id=technician_id,
                receiver_id=user_id,
                sender_name="Admin",
                message=notification_message,
                notification_type="technician_status",
                link_url=link_url  # Add this parameter
            )
            return jsonify({
                "success": True,
                "message": "Ticket status updated successfully"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Failed to update ticket status"
            }), 400
    except Exception as e:
        print(f"Error updating ticket status: {e}")
        return jsonify({
            "success": False,
            "message": "Error updating ticket status",
            "error": str(e)
        }), 500

def get_all_assigned_tickets(tech_id):
    try:
        tickets = fetch_all_tickets_from_db(tech_id)

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

def get_all_inventory_items():
    try:
        inventory_items = fetch_all_inventory_from_db()  # Call DB function to fetch inventory

        return jsonify({
            "success": True,
            "inventory": inventory_items,
            "message": "Inventory items fetched successfully"
        }), 200
    except Exception as e:
        print(f"Error fetching inventory items: {e}")
        return jsonify({
            "success": False,
            "message": "Error fetching inventory items",
            "error": str(e)
        }), 500

def process_spares_request(ticket_id, technician_id, items):
    try:
        # Call the model function to save the spares request in the database
        result = save_spares_request(ticket_id, technician_id, items)

        if result:
            notification_message = f"Spares request for Ticket #{ticket_id}."
            
            link_url = "/admin/inventory"

            send_notification(
                sender_id=technician_id,
                receiver_id=1,  # Assuming 1 is the admin/system user
                sender_name="Technician",
                message=notification_message,
                notification_type="spares_request",
                link_url=link_url  # Add this parameter
            )

            return jsonify({
                "success": True,
                "message": "Spares request submitted successfully"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Failed to submit spares request"
            }), 400
    except Exception as e:
        print(f"Error processing spares request: {e}")
        return jsonify({
            "success": False,
            "message": "Error processing spares request",
            "error": str(e)
        }), 500

def get_requested_spares(ticket_id):
    try:
        requested_spares = fetch_requested_spares_from_db(ticket_id)  # Call DB function to fetch requested spares

        return jsonify({
            "success": True,
            "requested_spares": requested_spares,
            "message": "Requested spares fetched successfully"
        }), 200
    except Exception as e:
        print(f"Error fetching requested spares: {e}")
        return jsonify({
            "success": False,
            "message": "Error fetching requested spares",
            "error": str(e)
        }), 500

def close_ticket(ticket_id, status, closure_log, technician_id,user_id):
    try:
        # Call the model to update the ticket status and closure log in the database
        result = close_ticket_in_db(ticket_id, status, closure_log, technician_id)

        if result:
            notification_message = f"Your ticket #{ticket_id} has been closed by our technician.Please close the ticket and give Feedback"

            link_url = "/ticket-history"

            send_notification(
                sender_id=technician_id,  # Technician as sender
                receiver_id=user_id,  
                sender_name="Technician",
                message=notification_message,
                notification_type="ticket_closed",
                link_url=link_url  # Add this parameter
            )
            return jsonify({
                "success": True,
                "message": "Ticket closed successfully"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Failed to close ticket"
            }), 400
    except Exception as e:
        print(f"Error closing ticket: {e}")
        return jsonify({
            "success": False,
            "message": "Error closing ticket",
            "error": str(e)
        }), 500
    


