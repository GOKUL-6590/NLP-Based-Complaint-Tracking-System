from ..models.user import create_user, get_user_by_email, update_user_password
from flask import jsonify
from werkzeug.security import generate_password_hash
import pyscrypt
import base64
from werkzeug.security import check_password_hash, generate_password_hash

from ..models.notifications import create_notification, send_notification
from ..models.user import get_all_admins


def register_user(data):
    # Check for missing fields
    required_fields = ['name', 'email', 'password', 'phoneNumber']
    if any(field not in data or not data[field] for field in required_fields):
        return jsonify({'message': 'Missing fields', 'success': False}), 200

    # Check if user already exists
    user = get_user_by_email(data['email'])
    if user:
        return jsonify({'message': 'Email already exists', 'success': False}), 200

    # Determine role and approval status
    role = data.get('role', 'user')
    if role not in ['user', 'technician']:
        return jsonify({'message': 'Invalid role specified', 'success': False}), 200

    # Set approval status based on role
    isApproved = role == 'user'  # Users are approved by default, technicians need admin approval

    # Hash the password before storing
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')

    # Create user
    result = create_user(
        name=data['name'],
        email=data['email'],
        password=hashed_password,  # Store hashed password
        role=role,
        phone_number=data['phoneNumber'],
        is_approved=isApproved  # Pass approval status to the user creation function
    )

    if not result:
        return jsonify({'message': 'Error in Service', 'success': False}), 500

    user = get_user_by_email(data['email'])
    # Notify admins if role is technician
    if role == 'technician' and not isApproved:
        admins = get_all_admins()  # Fetch all admin users
        for admin in admins:
            send_notification(
                sender_id=user['id'], 
                receiver_id=admin['id'], 
                sender_name='System', 
                message=f"New technician '{data['name']}' requires approval.", 
                notification_type='Technician Approval'
            )

    # Success response
    message = 'User registered successfully.'
    if role == 'technician' and not isApproved:
        message += ' Pending admin approval.'

    return jsonify({'message': message, 'success': True}), 201




def verify_scrypt_password(stored_hash, provided_password):
    try:
        parts = stored_hash.split("$")
        if len(parts) != 3:
            return False  # Invalid hash format
        
        salt, hashed_pw = parts[1], parts[2]

        # Convert salt and hashed password to bytes
        salt_bytes = base64.b64decode(salt)
        hashed_pw_bytes = base64.b64decode(hashed_pw)

        # Hash the provided password using the same salt
        computed_hash = pyscrypt.hash(
            password=provided_password.encode(),
            salt=salt_bytes,
            N=32768,
            r=8,
            p=1,
            dkLen=len(hashed_pw_bytes)
        )

        return computed_hash == hashed_pw_bytes  # Compare hashes
    except Exception as e:
        print(f"Error verifying Scrypt password: {e}")
        return False


from werkzeug.security import check_password_hash

def login_user(data):
    try:
        if not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Missing fields', 'success': False}), 200

        user = get_user_by_email(data['email'])
        if not user:
            return jsonify({'message': 'User not found', 'success': False}), 200

        stored_password = user['password']
        input_password = data['password']

        print(f"Stored password from DB: {stored_password}")
        print(f"Input password: {input_password}")
        hashed_new = generate_password_hash("swe123", method='pbkdf2:sha256')
        print(hashed_new)
        # Verify password
        password_matches = check_password_hash(stored_password, input_password)

        print(f"Password verification result: {password_matches}")

        if not password_matches:
            return jsonify({'message': 'Password does not match', 'success': False}), 200

        return jsonify({'message': 'Login Success', 'user': user, 'success': True}), 200

    except Exception as e:
        print(f"Error during login: {str(e)}")
        return jsonify({'message': 'An unexpected error occurred. Please try again later.', 'success': False}), 500
