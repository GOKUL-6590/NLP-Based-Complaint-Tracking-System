from flask import request, jsonify

from backend.models.messages import get_mapped_technicians_by_user ,get_mapped_users_by_technician ,get_messages_by_participants

def fetch_mapped_technicians():
    """
    Fetch technicians mapped to a user's tickets.
    """
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({
                "message": "user_id is required",
                "success": False
            }), 400

        technicians = get_mapped_technicians_by_user(user_id)
        if technicians is None:
            return jsonify({
                "message": "Failed to fetch mapped technicians.",
                "success": False
            }), 500

        return jsonify({
            "message": "Mapped technicians fetched successfully.",
            "contacts": technicians,
            "success": True
        }), 200

    except Exception as e:
        print(f"Error fetching mapped technicians: {str(e)}")
        return jsonify({
            "message": "An unexpected error occurred. Please try again later.",
            "success": False,
            "error": str(e)
        }), 500

def fetch_mapped_users():
    """
    Fetch users mapped to a technician's tickets.
    """
    try:
        technician_id = request.args.get("technician_id")
        if not technician_id:
            return jsonify({
                "message": "technician_id is required",
                "success": False
            }), 400

        users = get_mapped_users_by_technician(technician_id)
        if users is None:
            return jsonify({
                "message": "Failed to fetch mapped users.",
                "success": False
            }), 500

        return jsonify({
            "message": "Mapped users fetched successfully.",
            "contacts": users,
            "success": True
        }), 200

    except Exception as e:
        print(f"Error fetching mapped users: {str(e)}")
        return jsonify({
            "message": "An unexpected error occurred. Please try again later.",
            "success": False,
            "error": str(e)
        }), 500

def fetch_user_messages(is_technician):
    """
    Fetch messages between a user and a technician.
    """
    try:
        user_id = request.args.get("user_id")
        technician_id = request.args.get("technician_id")
        if not user_id or not technician_id:
            return jsonify({
                "message": "user_id and technician_id are required",
                "success": False
            }), 400

        # Convert to integers (since they're passed as strings in query params)
        user_id = int(user_id)
        technician_id = int(technician_id)

        messages = get_messages_by_participants(user_id, technician_id, is_technician)
        if messages is None:
            return jsonify({
                "message": "Failed to fetch messages.",
                "success": False
            }), 500

        return jsonify({
            "message": "Messages fetched successfully.",
            "messages": messages,
            "success": True
        }), 200

    except Exception as e:
        print(f"Error fetching messages: {str(e)}")
        return jsonify({
            "message": "An unexpected error occurred. Please try again later.",
            "success": False,
            "error": str(e)
        }), 500

