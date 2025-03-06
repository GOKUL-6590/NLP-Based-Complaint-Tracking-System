import logging
import json
from flask import Blueprint, jsonify, request
from ..controller.admin_controller import (
    add_item_to_inventory_controller,
    assign_ticket_controller,
    fetch_all_users,
    get_all_technician_metrics_for_admin,
    get_all_tickets_for_admin,
    get_approved_technicians,
    get_assigned_tickets,
    get_available_technicians,
    get_dashboard_data,
    get_inventory_items,
    get_spare_requests,
    get_unassigned_tickets,
    process_technician_approval_rejection,
    get_unapproved_technicians,
    process_ticket_priority_update,
    update_spare_request_status_controller
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

admin_bp = Blueprint('admin_bp', __name__)

# Helper function for handling exceptions
def handle_exception(e, message):
    logger.error(f"{message}: {str(e)}")
    return jsonify({"success": False, "message": message, "error": str(e)}), 500

@admin_bp.route('/unapproved-technicians', methods=['GET'])
def fetch_unapproved_technicians():
    try:
        return get_unapproved_technicians()
    except Exception as e:
        return handle_exception(e, "Error fetching unapproved technicians")

@admin_bp.route('/approved-technicians', methods=['GET'])
def fetch_approved_technicians():
    try:
        return get_approved_technicians()
    except Exception as e:
        return handle_exception(e, "Error fetching approved technicians")

@admin_bp.route("/technician-approval-or-rejection/<string:action>", methods=["POST"])
def technician_approval_rejection(action):
    try:
        data = json.loads(request.data.decode('utf-8'))
        technician_id = data.get('technicianId')
        
        if not technician_id:
            return jsonify({"message": "Technician ID is required.", "success": False}), 400
        
        if action not in ['approve', 'reject']:
            return jsonify({"message": "Invalid action. Must be 'approve' or 'reject'.", "success": False}), 400

        return process_technician_approval_rejection(technician_id, action)
    except Exception as e:
        return handle_exception(e, "Error processing technician approval/rejection")

@admin_bp.route("/get-users", methods=["GET"])
def get_users():
    try:
        return fetch_all_users()
    except Exception as e:
        return handle_exception(e, "Error fetching users")

@admin_bp.route("/get-admin-dashboard", methods=["GET"])
def dashboard():
    try:
        return get_dashboard_data()
    except Exception as e:
        return handle_exception(e, "Error fetching dashboard data")

@admin_bp.route("/get-assigned-tickets", methods=["GET"])
def get_assigned_tickets_route():
    try:
        return get_assigned_tickets()
    except Exception as e:
        return handle_exception(e, "Error fetching assigned tickets")

@admin_bp.route("/get-unassigned-tickets", methods=["GET"])
def get_unassigned_tickets_route():
    try:
        return get_unassigned_tickets()
    except Exception as e:
        return handle_exception(e, "Error fetching unassigned tickets")

@admin_bp.route("/technicians-availability", methods=["GET"])
def get_technicians_availability():
    try:
        return get_available_technicians()
    except Exception as e:
        return handle_exception(e, "Error fetching technician availability")

@admin_bp.route('/assign-ticket-by-admin', methods=['POST'])
def assign_ticket():
    try:
        data = json.loads(request.data.decode('utf-8'))
        ticket_id = data.get('ticketId')
        technician_id = data.get('technicianId')
        assign_type = data.get('assignType')
        
        if not all([ticket_id, technician_id, assign_type]):
            return jsonify({"error": "Missing parameters", "success": False}), 400
        
        return assign_ticket_controller(ticket_id, technician_id, assign_type)
    except Exception as e:
        return handle_exception(e, "Error assigning ticket")

@admin_bp.route("/get-all-tickets", methods=["GET"])
def fetch_all_tickets_for_admin():
    try:
        return get_all_tickets_for_admin()
    except Exception as e:
        return handle_exception(e, "Error fetching all tickets")

@admin_bp.route("/get-all-technician-metrics", methods=["GET"])
def fetch_all_technician_metrics_for_admin():
    try:
        return get_all_technician_metrics_for_admin()
    except Exception as e:
        return handle_exception(e, "Error fetching technician metrics")

@admin_bp.route("/add-item-to-inventory", methods=["POST"])
def add_item_to_inventory():
    try:
        data = json.loads(request.data.decode('utf-8'))
        print(data)
        return add_item_to_inventory_controller(data)  # Call the controller function
    except Exception as e:
        return handle_exception(e, "Error adding item to inventory")

@admin_bp.route("/get-inventory-items", methods=["GET"])
def fetch_inventory_items():
    try:
        return get_inventory_items()
    except Exception as e:
        return handle_exception(e, "Error fetching inventory items")

@admin_bp.route("/get-spare-requests", methods=["GET"])
def fetch_spare_requests():
    try:
        return get_spare_requests()
    except Exception as e:
        return handle_exception(e, "Error fetching spare requests")
    
@admin_bp.route("/update-spare-request-status", methods=["POST"])
def update_spare_request_status():
    try:
        data = json.loads(request.data.decode('utf-8'))  # Parse incoming JSON request
        print("Received data:", data)

        request_id = data.get("request_id")
        status = data.get("status")
        user_id = data.get("user_id")
        ticket_id = data.get("ticket_id")
        technician_id = data.get("technician_id")

        if not request_id or not status or not user_id:
            return jsonify({"success": False, "message": "Missing required parameters"}), 400

        return update_spare_request_status_controller(request_id, status, user_id,ticket_id,technician_id)  # Call the controller function
    except Exception as e:
        return handle_exception(e, "Error updating spare request status")

@admin_bp.route("/technician/tickets/<string:ticket_id>/priority", methods=["PUT"])
def update_ticket_priority(ticket_id):
    try:
        data = json.loads(request.data.decode('utf-8'))
        priority = data.get('priority')
        user_id = data.get('user_id')  # Assuming admin ID is sent as 'updated_by'
        technician_id=data.get('technician_id')

        if not ticket_id:
            return jsonify({"message": "Ticket ID is required.", "success": False}), 400
        if not priority:
            return jsonify({"message": "Priority is required.", "success": False}), 400
        if not user_id:
            return jsonify({"message": "User ID is required.", "success": False}), 400
        if priority not in ['Low', 'Medium', 'High']:
            return jsonify({"message": "Invalid priority. Must be 'Low', 'Medium', or 'High'.", "success": False}), 400

        return process_ticket_priority_update(ticket_id, priority, user_id,technician_id)
    except Exception as e:
        return handle_exception(e, "Error updating ticket priority")
    
    