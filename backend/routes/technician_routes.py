import json
from flask import Blueprint, request, jsonify

from backend.controller.technician_controller import (
    close_ticket,
    get_all_assigned_tickets,
    get_all_inventory_items,
    get_assigned_tickets,
    get_requested_spares, 
    get_technician_stats,
    process_spares_request, 
    update_ticket_status
)

technician_bp = Blueprint('technician_bp', __name__)

# Route to get technician stats
@technician_bp.route("/get-technician-dashboard", methods=["GET"])
def technician_stats():
    technician_id = request.args.get("technician_id")

    if not technician_id:
        return jsonify({"success": False, "message": "Missing technician_id"}), 400

    return get_technician_stats(technician_id)

# Route to fetch assigned tickets for a technician
@technician_bp.route("/get-assigned-tickets-by-technicanId", methods=["GET"])
def fetch_tickets():
    tech_id = request.args.get("tech_id")  # Get technician ID from query params

    if not tech_id:
        return jsonify({"success": False, "message": "Technician ID is required"}), 400

    return get_assigned_tickets(tech_id)

# Route to update the status of a ticket
@technician_bp.route('/update_ticket_status', methods=['POST'])
def update_ticket_status_route():
    try:
        data = json.loads(request.data.decode('utf-8'))
        
        # Check for missing data fields
        if not data or "ticketId" not in data or "status" not in data:
            return jsonify({"success": False, "message": "Missing ticket_id or status"}), 400
        
        ticket_id = data["ticketId"]
        status = data["status"]
        technician_id = data["technician_id"]
        user_id = data["user_id"]
        
        # Call controller function to update status
        return update_ticket_status(ticket_id, status, technician_id, user_id)
    
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid data provided"}), 400

# Route to get all assigned tickets for a technician
@technician_bp.route("/get-all-tickets-by-technicanId", methods=["GET"])
def fetch_all_tickets():
    tech_id = request.args.get("tech_id")  # Get technician ID from query params

    if not tech_id:
        return jsonify({"success": False, "message": "Technician ID is required"}), 400

    return get_all_assigned_tickets(tech_id)

@technician_bp.route("/get-all-items", methods=["GET"])
def fetch_all_items():
    return get_all_inventory_items()


@technician_bp.route('/send-spares-request-to-admin', methods=['POST'])
def request_spares_route():
    try:
        data = json.loads(request.data.decode('utf-8'))

        # Validate required fields
        if not data or "ticketId" not in data or "technicianId" not in data or "items" not in data:
            return jsonify({"success": False, "message": "Missing required fields"}), 400

        ticket_id = data["ticketId"]
        technician_id = data["technicianId"]
        items = data["items"]  # This should be a list of dictionaries with item details

        if not isinstance(items, list) or not all("itemId" in item and "itemName" in item and "quantity" in item for item in items):
            return jsonify({"success": False, "message": "Invalid items format"}), 400

        # Call the controller function to process the request
        return process_spares_request(ticket_id, technician_id, items)

    except Exception as e:
        return jsonify({"success": False, "message": "Invalid data provided", "error": str(e)}), 400


@technician_bp.route("/get-requested-spares-by-ticketId", methods=["GET"])
def fetch_requested_spares():
    ticket_id = request.args.get("ticketId")  # Get ticket ID from query params
    print(ticket_id)

    if not ticket_id:
        return jsonify({"success": False, "message": "Ticket ID is required"}), 400

    return get_requested_spares(ticket_id)  # Call the controller function


@technician_bp.route('/close_ticket', methods=['POST'])
def close_ticket_route():
    try:
        data = json.loads(request.data.decode('utf-8'))
        
        # Check for missing data fields
        if not data or "ticketId" not in data or "status" not in data or "closure_log" not in data:
            return jsonify({"success": False, "message": "Missing ticket_id, status, or closure_log"}), 400
        
        ticket_id = data["ticketId"]
        status = data["status"]
        closure_log = data["closure_log"]
        technician_id = data["technician_id"]
        user_id = data["user_id"]
        
        # Call controller function to close ticket
        return close_ticket(ticket_id, status, closure_log, technician_id,user_id)
    
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid data provided"}), 400

