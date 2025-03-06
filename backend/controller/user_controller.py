from flask import jsonify, request
from flask_socketio import SocketIO
import json



from backend.NLP.classifier import classify_complaint
from backend.models.technician import assign_unassigned_tickets
from backend.models.user import assign_ticket_to_technician, create_new_ticket, dispute_ticket_in_db, get_ticket_by_id, get_tickets_by_userid, get_tickets_stats, store_push_subscription
from ..models.notifications import  delete_notifications_by_receiver, get_notifications_by_receiver, get_unread_notifications_count_by_userid, mark_all_notification_as_read, mark_notification_as_read, save_fcm_token_to_db
from flask import jsonify
from datetime import datetime, timedelta
from flask import request, jsonify


def fetch_notifications():
    """
    Fetch notifications for the logged-in user.
    """
    try:
        # Retrieve receiver_id from query params
        receiver_id = request.args.get("receiver_id")  
        print(receiver_id)
        if not receiver_id:
            return jsonify({
                'message': 'Receiver ID is required.',
                'success': False
            }), 400

        # Fetch notifications from the model
        notifications = get_notifications_by_receiver(receiver_id)
        
        if notifications is None:
            return jsonify({
                'message': 'Failed to fetch notifications.',
                'success': False
            }), 500

        # Success response with the list of notifications
        return jsonify({
            'message': 'Notifications fetched successfully.',
            'notifications': notifications,
            'success': True
        }), 200

    except Exception as e:
        # Log the error and send an error response
        print(f"Error fetching notifications: {str(e)}")
        return jsonify({
            'message': 'An unexpected error occurred. Please try again later.',
            'success': False,
            'error': str(e)
        }), 500


def mark_as_read(notification_id,user_id):
    """
    Mark a notification as read.
    """
    try:
        if not notification_id or not user_id:
            return jsonify({"message": "Invalid parameters.", "success": False}), 400
        # Mark the notification as read in the model
        success = mark_notification_as_read(notification_id)
        
        if not success:
            return jsonify({
                'message': 'Failed to mark notification as read.',
                'success': False
            }), 500
        

        # Success response
        return jsonify({
            'message': 'Notification marked as read successfully.',
            'success': True
        }), 200

    except Exception as e:
        # Log the error and send an error response
        print(f"Error marking notification as read: {str(e)}")
        return jsonify({
            'message': 'An unexpected error occurred. Please try again later.',
            'success': False,
            'error': str(e)
        }), 500


def mark_all_as_read(receiver_id):
    try:
        success = mark_all_notification_as_read(receiver_id)
        if not success:
            return jsonify({
                'message': 'Failed to mark notifications as read.',
                'success': False
            }), 500
        

        return jsonify({
            'message': 'Notifications marked as read successfully.',
            'success': True
        }), 200

    except Exception as e:
        print(f"Error marking notifications as read: {str(e)}")
        return jsonify({
            'message': 'An unexpected error occurred. Please try again later.',
            'success': False,
            'error': str(e)
        }), 500

def get_unread_notifications_count(user_id):
    try:
        count = get_unread_notifications_count_by_userid(user_id)
        if count<0:
                return jsonify({
                'message': 'Failed to get notification count.',
                'success': False
                }), 500

        # Success response
        return jsonify({
            'message': 'Notification count fetched successfully.',
            'success': True,
            'count':count
            }), 200

    except Exception as e:
        # Log the error and send an error response
            print(f"Error getting notification count: {str(e)}")
            return jsonify({
            'message': 'An unexpected error occurred. Please try again later.',
            'success': False,
            'error': str(e)
            }), 500        



def delete_all_notifications_by_receiver(receiver_id):
    """
    Controller logic to delete all notifications for a specific receiver.
    """
    try:
        success = delete_notifications_by_receiver(receiver_id)

        if success:
            return jsonify({
                'message': 'All notifications deleted successfully.',
                'success': True
            }), 200
        else:
            return jsonify({
                'message': 'Failed to delete notifications.',
                'success': False
            }), 500

    except Exception as e:
        print(f"Error in delete_all_notifications_by_receiver: {e}")
        return jsonify({
            'message': 'An unexpected error occurred.',
            'success': False,
            'error': str(e)
        }), 500

def new_ticket_creator(data):
    try:
        if not data:
            return jsonify({
                'message': 'No data provided in the request.',
                'success': False,
                'error_code': 'MISSING_DATA'
            }), 400

        data['priority'] = classify_complaint(data['description'])

        required_fields = ['systemNumber', 'venue', 'block', 'category', 'description', 'status', 'priority']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'message': f"Missing required fields: {', '.join(missing_fields)}.",
                'success': False,
                'error_code': 'MISSING_FIELDS'
            }), 400

        ticket_id = create_new_ticket(data)
        if not ticket_id:
            return jsonify({
                'message': 'Failed to create a new ticket.',
                'success': False,
                'error_code': 'TICKET_CREATION_FAILED'
            }), 500

        # Determine SLA deadline
        priority_sla = {'high': 2, 'medium': 5, 'low': 36}
        sla_hours = priority_sla.get(data['priority'], 36)
        sla_deadline = datetime.now() + timedelta(hours=sla_hours)
        data['sla_deadline'] = sla_deadline
        assign_unassigned_tickets()
        assigned = assign_ticket_to_technician(ticket_id, data['userid'], data['priority'], sla_deadline)
        if not assigned:
            return jsonify({
                'message': 'Ticket created but failed to assign to a technician.',
                'success': True,
                'ticket_id': ticket_id
            }), 500

        return jsonify({
            'message': 'Ticket created successfully.',
            'ticket_id': ticket_id,
            'success': True
        }), 201

    except Exception as e:
        print(f"Error creating new ticket: {e}")
        return jsonify({
            'message': 'An unexpected error occurred. Please try again later.',
            'success': False,
            'error_code': 'SERVER_ERROR',
            'error': str(e)
        }), 500

# Controller to save FCM token
def save_fcm_token_controller(user_id,fcm_token):
    """
    Controller to handle the logic of saving an FCM token.
    """
    # Example: Replace `user_id` with the authenticated user's ID (get from session or JWT)
      # Fetch dynamically in a real app

    try:
        # Call the database function
        save_fcm_token_to_db(user_id, fcm_token)
        return jsonify({'message': 'Token saved successfully.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_user_dashboard():
    """
    Controller function to fetch user-specific ticket statistics.
    """
    try:
        user_id = request.args.get("user_id")  # Get user ID from query params
        if not user_id:
            return jsonify({
                "message": "User ID is required.",
                "success": False
            }), 400

        stats = get_tickets_stats(user_id)  # Call model function

        if stats is None:
            return jsonify({
                "message": "Failed to fetch dashboard data.",
                "success": False
            }), 500

        return jsonify({
            "message": "Dashboard data fetched successfully.",
            "dashboard_data": {
                "opened_today": stats["opened_today"],
                "active_tickets": stats["active_tickets"],
                "closed_tickets": stats["closed_tickets"],
                "total_tickets": stats["total_tickets"],
                "active_tickets_list": stats["active_tickets_list"]
            },
            "success": True
        }), 200

    except Exception as e:
        print(f"Error fetching dashboard data: {str(e)}")
        return jsonify({
            "message": "An unexpected error occurred. Please try again later.",
            "success": False,
            "error": str(e)
        }), 500
    


def dispute_ticket(ticket_id):
    """
    Controller function to mark a ticket as disputed.
    """
    try:
        if not ticket_id:
            return jsonify({
                "message": "Ticket ID is required.",
                "success": False
            }), 400

        result = dispute_ticket_in_db(ticket_id)  # Call model function

        if not result:
            return jsonify({
                "message": "Failed to dispute the ticket.",
                "success": False
            }), 500

        return jsonify({
            "message": "Ticket disputed successfully.",
            "success": True
        }), 200

    except Exception as e:
        print(f"Error disputing ticket: {str(e)}")
        return jsonify({
            "message": "An unexpected error occurred. Please try again later.",
            "success": False,
            "error": str(e)
        }), 500


def get_user_tickets_by_id(user_id):
    """
    Controller function to fetch user-specific ticket statistics.
    """
    try:
          # Get user ID from query params
        if not user_id:
            return jsonify({
                "message": "User ID is required.",
                "success": False
            }), 400

        tickets = get_tickets_by_userid(user_id)  # Call model function

        if tickets is None:
            return jsonify({
                "message": "Failed to fetch dashboard data.",
                "success": False
            }), 500

        return jsonify({
            "message": "Dashboard data fetched successfully.",
            "tickets": tickets,
            "success": True
        }), 200

    except Exception as e:
        print(f"Error fetching dashboard data: {str(e)}")
        return jsonify({
            "message": "An unexpected error occurred. Please try again later.",
            "success": False,
            "error": str(e)
        }), 500
 
def get_ticket_details_by_id(ticket_id):
    try:
        # Validate ticket_id
        if not ticket_id:
            return jsonify({
                "message": "Ticket ID is required.",
                "success": False
            }), 400

        # Call model function to fetch ticket details
        ticket = get_ticket_by_id(ticket_id)

        if ticket is None:
            return jsonify({
                "message": "Ticket not found or failed to fetch ticket details.",
                "success": False
            }), 404

        return jsonify({
            "message": "Ticket details fetched successfully.",
            "ticket": ticket,
            "success": True
        }), 200

    except Exception as e:
        print(f"Error fetching ticket details: {str(e)}")
        return jsonify({
            "message": "An unexpected error occurred. Please try again later.",
            "success": False,
            "error": str(e)
        }), 500
    
def process_notification_subscription(user_id, subscription):
    try:
        # Call the model to store the subscription
        success = store_push_subscription(user_id, subscription)
        
        if success:
            return jsonify({
                "message": "Subscribed successfully",
                "success": True
            }), 200
        else:
            return jsonify({
                "message": "Failed to store push subscription.",
                "success": False
            }), 500

    except Exception as e:
        print(f"Error processing notification subscription: {str(e)}")
        return jsonify({
            "message": "An unexpected error occurred. Please try again later.",
            "success": False,
            "error": str(e)
        }), 500

