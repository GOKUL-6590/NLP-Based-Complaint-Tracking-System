import sys
import os

# Add the parent directory to the sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend import create_app
# Create the Flask app instance
from Sockets.socket import socketio  # Ensure you import socketio
app = create_app()

# Run the Flask server
if __name__ == '__main__':
    from backend.Sockets.socket import socketio  # Ensure socketio is imported
    socketio.run(app, debug=True, use_reloader=True, host="0.0.0.0", port=5000)


