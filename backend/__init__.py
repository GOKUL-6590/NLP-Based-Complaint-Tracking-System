from flask import Flask
from .config import Config
from flask_cors import CORS
from .routes.auth_routes import auth_bp
from .routes.technician_routes import technician_bp
from .routes.admin_routes import admin_bp
from .routes.user_routes import user_bp
from .Sockets.socket import socketio
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/*": {"origins": "*"}})
    socketio.init_app(app)
    
    
    # Register the auth blueprint for authentication routes
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    

    app.register_blueprint(technician_bp, url_prefix='/technician')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(user_bp, url_prefix='/users')

    
    return app
