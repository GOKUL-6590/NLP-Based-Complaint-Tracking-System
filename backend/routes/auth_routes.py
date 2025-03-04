from flask import Blueprint, json, request, jsonify
from ..controller.auth_controller import register_user, login_user, update_password

auth_bp = Blueprint('auth_bp', __name__)

# Route for user registration
@auth_bp.route('/register', methods=['POST'])
def register():
    data = json.loads(request.data.decode('utf-8'))

    print(data)
    return register_user(data)

# Route for user login
@auth_bp.route('/login', methods=['POST'])
def login():
    data = json.loads(request.data.decode('utf-8'))
    return login_user(data)

@auth_bp.route('/update-password', methods=['PUT'])
def update_password_route():
    data = json.loads(request.data.decode('utf-8'))
    return update_password(data)  # Forward to controller