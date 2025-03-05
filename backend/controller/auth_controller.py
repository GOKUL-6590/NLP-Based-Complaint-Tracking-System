from ..models.user import create_user, get_user_by_email, get_user_by_id, update_user_password
from flask import jsonify


from ..models.notifications import create_notification, send_notification
from ..models.user import get_all_admins
import bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

def register_user(data):
    required_fields = ['name', 'email', 'password', 'phoneNumber']
    if any(field not in data or not data[field] for field in required_fields):
        return jsonify({'message': 'Missing fields', 'success': False}), 200

    user = get_user_by_email(data['email'])
    if user:
        return jsonify({'message': 'Email already exists', 'success': False}), 200

    role = data.get('role', 'user')
    if role not in ['user', 'technician']:
        return jsonify({'message': 'Invalid role specified', 'success': False}), 200

    isApproved = role == 'user'

    # Hash password with bcrypt
    password = data['password'].encode('utf-8')
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

    result = create_user(
        name=data['name'],
        email=data['email'],
        password=hashed_password,  # Store as string
        role=role,
        phone_number=data['phoneNumber'],
        is_approved=isApproved
    )

    if not result:
        return jsonify({'message': 'Error in Service', 'success': False}), 500

    user = get_user_by_email(data['email'])
    if role == 'technician' and not isApproved:
        admins = get_all_admins()
        for admin in admins:
            link_url = "/admin/users"  # Direct to technician's profile for approval
            send_notification(
                sender_id=user['id'], 
                receiver_id=admin['id'], 
                sender_name='System', 
                message=f"New technician '{data['name']}' requires approval.", 
                notification_type='Technician Approval',
                link_url=link_url  # Add this parameter
            )

    message = 'User registered successfully.'
    if role == 'technician' and not isApproved:
        message += ' Pending admin approval.'

    return jsonify({'message': message, 'success': True}), 201
def login_user(data):
    required_fields = ['email', 'password']
    if any(field not in data or not data[field] for field in required_fields):
        return jsonify({'message': 'Missing fields', 'success': False}), 400

    user = get_user_by_email(data['email'])
    if not user:
        return jsonify({'message': 'Invalid email or password', 'success': False}), 401

    if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'message': 'Invalid email or password', 'success': False}), 401

    # Explicitly convert user['id'] to string for JWT
    access_token = create_access_token(identity=str(user['id']))
    user_data = {
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'role': user['role'],
        'phoneNumber': user.get('phoneNumber'),
        'is_approved': user['is_approved']
    }

    return jsonify({
        'message': 'Login successful',
        'success': True,
        'user': user_data,
        'token': access_token
    }), 200


@jwt_required()
def update_password(data):
    required_fields = ['oldPassword', 'newPassword']
    if any(field not in data or not data[field] for field in required_fields):
        return jsonify({'message': 'Missing fields', 'success': False}), 200

    # Get the authenticated user's ID from JWT
    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)

    if not user:
        return jsonify({'message': 'User not found', 'success': False}), 404

    # Verify old password
    old_password = data['oldPassword'].encode('utf-8')
    stored_password = user['password'].encode('utf-8')  # Convert stored varchar to bytes for bcrypt
    if not bcrypt.checkpw(old_password, stored_password):
        return jsonify({'message': 'Incorrect old password', 'success': False}), 400

    # Validate new password
    new_password = data['newPassword']
    if len(new_password) < 4:
        return jsonify({'message': 'New password must be at least 4 characters long', 'success': False}), 400

    # Hash new password
    hashed_new_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

    # Update user in the database
    result = update_user_password(user_id, hashed_new_password)

    if not result:
        return jsonify({'message': 'Error updating password', 'success': False}), 500

    return jsonify({'message': 'Password updated successfully', 'success': True}), 200       