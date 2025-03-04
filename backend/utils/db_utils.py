import mysql.connector
import os
from dotenv import load_dotenv


load_dotenv()

def get_db_connection():
    # Create and return a MySQL database connection
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),  
            user=os.getenv('DB_USER'),    
            password=os.getenv('DB_PASSWORD'),  
            database=os.getenv('DB_NAME'),  
    )
    return conn
