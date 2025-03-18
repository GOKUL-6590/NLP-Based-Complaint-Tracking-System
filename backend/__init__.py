from flask import Flask
from .config import Config
from flask_cors import CORS
from .routes.auth_routes import auth_bp
from .routes.technician_routes import technician_bp
from .routes.admin_routes import admin_bp
from .routes.user_routes import user_bp
from .routes.messages_routes import messages_bp
from .Sockets.socket import socketio
from flask_jwt_extended import JWTManager
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['JWT_SECRET_KEY'] = 'ironman'  # Replace with a secure, unique key
    jwt = JWTManager(app)
    CORS(app, resources={r"/*": {"origins": "*"}})
    socketio.init_app(app)
    
    
    # Register the auth blueprint for authentication routes
    app.register_blueprint(auth_bp, url_prefix='/api/auth')   

    app.register_blueprint(technician_bp, url_prefix='/technician')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(messages_bp, url_prefix="/messages")

    
    return app
