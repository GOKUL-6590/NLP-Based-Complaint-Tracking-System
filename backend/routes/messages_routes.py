from flask import Blueprint, jsonify, request

from backend.controller.messages_controller import fetch_mapped_technicians ,fetch_mapped_users ,fetch_user_messages
from backend.models.messages import get_unread_counts, mark_messages_as_read

messages_bp = Blueprint("messages", __name__)

# Fetch mapped technicians for a user
@messages_bp.route("/user/mapped-technicians", methods=["GET"])
def get_mapped_technicians():
    try:
        return fetch_mapped_technicians()
    except Exception as e:
        return jsonify({
            "message": "An unexpected error occurred while fetching mapped technicians.",
            "success": False,
            "error": str(e)
        }), 500

# Fetch mapped users for a technician
@messages_bp.route("/technician/mapped-users", methods=["GET"])
def get_mapped_users():
    try:
        return fetch_mapped_users()
    except Exception as e:
        return jsonify({
            "message": "An unexpected error occurred while fetching mapped users.",
            "success": False,
            "error": str(e)
        }), 500

# Fetch messages between a user and a technician
@messages_bp.route("/user/messages", methods=["GET"])
def get_user_messages():
    try:
        return fetch_user_messages(is_technician=False)  # User is requesting
    except Exception as e:
        return jsonify({
            "message": "An unexpected error occurred while fetching messages.",
            "success": False,
            "error": str(e)
        }), 500

@messages_bp.route("/technician/messages", methods=["GET"])
def get_technician_messages():
    try:
        return fetch_user_messages(is_technician=True)  # Technician is requesting
    except Exception as e:
        return jsonify({
            "message": "An unexpected error occurred while fetching messages.",
            "success": False,
            "error": str(e)
        }), 500


@messages_bp.route("/mark-messages-read", methods=["POST"])
def mark_messages_read():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        contact_id = data.get("contact_id")
        if not user_id or not contact_id:
            return jsonify({
                "message": "user_id and contact_id are required",
                "success": False
            }), 400

        success = mark_messages_as_read(user_id, contact_id)
        if success:
            return jsonify({
                "message": "Messages marked as read.",
                "success": True
            }), 200
        return jsonify({
            "message": "Failed to mark messages as read.",
            "success": False
        }), 500
    except Exception as e:
        return jsonify({
            "message": "An unexpected error occurred.",
            "success": False,
            "error": str(e)
        }), 500

@messages_bp.route("/unread-counts", methods=["GET"])
def get_unread_counts_endpoint():
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({
                "message": "user_id is required",
                "success": False
            }), 400

        user_id = int(user_id)
        unread_counts = get_unread_counts(user_id)
        return jsonify({
            "message": "Unread counts fetched successfully.",
            "unread_counts": unread_counts,
            "success": True
        }), 200
    except Exception as e:
        print(f"Error fetching unread counts: {str(e)}")
        return jsonify({
            "message": "An unexpected error occurred.",
            "success": False,
            "error": str(e)
        }), 500