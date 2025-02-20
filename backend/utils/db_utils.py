import mysql.connector

def get_db_connection():
    # Create and return a MySQL database connection
    conn = mysql.connector.connect(
        host='localhost',  # Change this to your MySQL host if needed
        user='root',       # Your MySQL username
        password='ironman2003',  # Your MySQL password
        database='complaint_tracking_system'  # Your database name
    )
    return conn
