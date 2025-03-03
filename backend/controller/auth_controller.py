from ..models.user import create_user, get_user_by_email, update_user_password
from flask import jsonify


from ..models.notifications import create_notification, send_notification
from ..models.user import get_all_admins
import bcrypt


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
            send_notification(
                sender_id=user['id'], 
                receiver_id=admin['id'], 
                sender_name='System', 
                message=f"New technician '{data['name']}' requires approval.", 
                notification_type='Technician Approval'
            )

    message = 'User registered successfully.'
    if role == 'technician' and not isApproved:
        message += ' Pending admin approval.'

    return jsonify({'message': message, 'success': True}), 201

def login_user(data):
    required_fields = ['email', 'password']
    if any(field not in data or not data[field] for field in required_fields):
        return jsonify({'message': 'Missing fields', 'success': False}), 200

    user = get_user_by_email(data['email'])
    if not user:
        return jsonify({'message': 'Invalid email or password', 'success': False}), 401

    # Ensure password comparison works with bcrypt
    entered_password = data['password'].encode('utf-8')  # Convert to bytes
    stored_password = user['password'].encode('utf-8')  # Convert stored hash to bytes

    if not bcrypt.checkpw(entered_password, stored_password):
        return jsonify({'message': 'Invalid email or password', 'success': False}), 401

    return jsonify({'message': 'Login successful', 'success': True, 'user': user}), 200


        