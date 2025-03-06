import json
from flask import Blueprint, request, jsonify
import cloudinary.uploader

from ..controller.user_controller import (
    delete_all_notifications_by_receiver,
    dispute_ticket,
    fetch_notifications,
    get_ticket_details_by_id,
    get_unread_notifications_count,
    get_user_dashboard,
    get_user_tickets_by_id,
    mark_all_as_read,
    mark_as_read,
    new_ticket_creator,
    process_notification_subscription,
    save_fcm_token_controller,
    submit_feedback,
)



user_bp = Blueprint("user", __name__)

# Route to fetch notifications
@user_bp.route("/notifications", methods=["GET"])
def get_user_notifications():
    try:
        return fetch_notifications()
    except Exception as e:
        return jsonify({
            'message': 'An unexpected error occurred while fetching notifications.',
            'success': False,
            'error': str(e)
        }), 500

@user_bp.route("/notifications/read/<int:notification_id>", methods=["POST"])
def mark_user_notification(notification_id):
    try:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({"success": False, "message": "User ID is required"}), 400
        return mark_as_read(notification_id, user_id)
    except Exception as e:
        return jsonify({
            'message': 'An unexpected error occurred while marking notification as read.',
            'success': False,
            'error': str(e)
        }), 500

# Route to mark all notifications as read
@user_bp.route("/notifications/read-all", methods=["POST"])
def mark_all_notifications_as_read():
    try:
        # Check the Content-Type of the request to ensure it's JSON
        if request.content_type != 'application/json':
            return jsonify({
                'message': 'Request must be in JSON format.',
                'success': False
            }), 400
        
        data = json.loads(request.data.decode('utf-8'))
        receiver_id = data.get("receiver_id")

        if not receiver_id:
            return jsonify({
                'message': 'receiver_id is required.',
                'success': False
            }), 400

        return mark_all_as_read(receiver_id)

    except Exception as e:
        return jsonify({
            'message': 'An unexpected error occurred while marking all notifications as read.',
            'success': False,
            'error': str(e)
        }), 500

# Route to get unread notifications count
@user_bp.route('/notifications/unread-count', methods=['GET'])
def unread_notifications():
    try:
        user_id = request.args.get('user_id')  # Get the user_id from query parameters
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        try:
            user_id = int(user_id)  # Ensure the user_id is an integer
        except ValueError:
            return jsonify({"error": "Invalid User ID"}), 400

        return get_unread_notifications_count(user_id)
    
    except Exception as e:
        return jsonify({
            'message': 'An unexpected error occurred while fetching unread notifications count.',
            'success': False,
            'error': str(e)
        }), 500

# Route to delete all notifications by receiver
@user_bp.route("/notifications/delete-all", methods=["DELETE"])
def delete_all_user_notifications():
    try:
        data = json.loads(request.data.decode('utf-8'))
        receiver_id = data.get("receiver_id")

        if not receiver_id:
            return jsonify({
                'message': 'receiver_id is required.',
                'success': False
            }), 400

        return delete_all_notifications_by_receiver(receiver_id)

    except Exception as e:
        return jsonify({
            'message': 'An unexpected error occurred while deleting notifications.',
            'success': False,
            'error': str(e)
        }), 500

# Route to raise a new ticket
@user_bp.route("/raise-ticket", methods=["POST"])
def raise_ticket():
    try:
        data = json.loads(request.data.decode('utf-8'))

        # Extract uploaded files
        attachments = data.get("attachments")

        if not data:
            return jsonify({
                'message': 'Form data is required.',
                'success': False
            }), 400

        # Add attachments to data
        data['attachments'] = attachments

        return new_ticket_creator(data)

    except Exception as e:
        return jsonify({
            'message': 'An unexpected error occurred while raising the ticket.',
            'success': False,
            'error': str(e)
        }), 500

# Route to save FCM token
@user_bp.route('/save-token', methods=['POST'])
def save_fcm_token_route():
    try:
        data = request.json
        fcm_token = data.get('fcmToken')
        user_id = data.get('userId')

        if not fcm_token:
            return jsonify({'error': 'FCM token is required'}), 400

        return save_fcm_token_controller(user_id, fcm_token)
    except Exception as e:
        return jsonify({
            'message': 'An unexpected error occurred while saving the FCM token.',
            'success': False,
            'error': str(e)
        }), 500

# Route to get user dashboard
@user_bp.route('/get-user-dashboard', methods=['GET'])
def dashboard():
    try:
        return get_user_dashboard()
    except Exception as e:
        return jsonify({
            'message': 'An unexpected error occurred while fetching the user dashboard.',
            'success': False,
            'error': str(e)
        }), 500

# Route to dispute a ticket by ticket ID
@user_bp.route('/dispute-ticket-by-id', methods=['POST'])
def dispute_ticket_by_id():
    try:
        data = json.loads(request.data.decode('utf-8'))
        ticket_id = data.get('ticket_id')

        if not ticket_id:
            return jsonify({
                'message': 'ticket_id is required.',
                'success': False
            }), 400

        return dispute_ticket(ticket_id)

    except Exception as e:
        return jsonify({
            'message': 'An unexpected error occurred while disputing the ticket.',
            'success': False,
            'error': str(e)
        }), 500

# Route to get ticket history by user ID
@user_bp.route('/get-ticket-history-by-userid', methods=['GET'])
def get_ticket_history():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        return get_user_tickets_by_id(user_id)
    except Exception as e:
        return jsonify({
            'message': 'An unexpected error occurred while fetching the ticket history.',
            'success': False,
            'error': str(e)
        }), 500

@user_bp.route('/tickets/<ticket_id>', methods=['GET'])
def get_ticket_details(ticket_id):
    try:
        # No additional parameters needed from request.args since ticket_id is in the URL
        if not ticket_id:
            return jsonify({"error": "Ticket ID is required"}), 400
        
        # Forward to controller
        return get_ticket_details_by_id(ticket_id)
    except Exception as e:
        return jsonify({
            "message": "An unexpected error occurred while fetching the ticket details.",
            "success": False,
            "error": str(e)
        }), 500

@user_bp.route("/notifications/subscribe", methods=["POST"])
def subscribe_to_notifications():
    try:
        data = json.loads(request.data.decode('utf-8'))
        user_id = data.get('user_id')
        subscription = data.get('subscription')

        if not user_id or not subscription:
            return jsonify({"message": "User ID and subscription are required.", "success": False}), 400

        return process_notification_subscription(user_id, subscription)
    except Exception as e:
        print(f"Error subscribing to notifications: {str(e)}")
        return jsonify({"message": "Error subscribing", "success": False, "error": str(e)}), 500


@user_bp.route('/tickets/<ticket_id>/feedback', methods=['POST'])
def submit_feedback_route(ticket_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No JSON data provided"}), 400
        
        # Pass the entire request data to the controller
        response = submit_feedback(ticket_id, data)
        return jsonify(response), 200 if response['success'] else 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

