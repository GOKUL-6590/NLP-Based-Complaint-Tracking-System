import mysql.connector
from backend.utils.db_utils import get_db_connection
from config import Config

def get_mapped_technicians_by_user(user_id):
    """Fetch technicians assigned to a user's tickets."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT DISTINCT u.id AS id, u.name, 'technician' AS role
            FROM users u
            JOIN ticket_mapping tm ON tm.technician_id = u.id
            JOIN tickets t ON t.ticket_id = tm.ticket_id
            WHERE tm.user_id = %s AND u.role = 'technician'
        """
        cursor.execute(query, (user_id,))
        technicians = cursor.fetchall()
        cursor.close()
        conn.close()
        return technicians
    except mysql.connector.Error as err:
        print(f"Error fetching mapped technicians: {err}")
        return None

def get_mapped_users_by_technician(technician_id):
    """Fetch users who submitted tickets assigned to a technician."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT DISTINCT u.id AS id, u.name 
            FROM users u
            JOIN ticket_mapping tm ON tm.user_id = u.id
            JOIN tickets t ON t.ticket_id = tm.ticket_id
            WHERE tm.technician_id = %s AND u.role != 'technician'
        """
        cursor.execute(query, (technician_id,))
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        return users
    except mysql.connector.Error as err:
        print(f"Error fetching mapped users: {err}")
        return None

def get_messages_by_participants(user_id, technician_id, is_technician):
    """Fetch messages between a user and a technician, filtered for the requesting user."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Determine the requesting user's ID based on is_technician
        requesting_user_id = technician_id if is_technician else user_id
        
        query = """
            SELECT sender_id, receiver_id, text, timestamp, is_read,
                   is_deleted_for_sender, is_deleted_for_receiver
            FROM messages
            WHERE ((sender_id = %s AND receiver_id = %s) OR (sender_id = %s AND receiver_id = %s))
            AND (
                (sender_id = %s AND is_deleted_for_sender = 0) OR
                (receiver_id = %s AND is_deleted_for_receiver = 0) OR
                (sender_id != %s AND receiver_id != %s)
            )
            ORDER BY timestamp ASC
        """
        params = (user_id, technician_id, technician_id, user_id, requesting_user_id, requesting_user_id, requesting_user_id, requesting_user_id)
        print(f"Executing query with params: {params}")  # Debug to verify parameters
        cursor.execute(query, params)
        messages = cursor.fetchall()
        cursor.close()
        conn.close()
        return messages
    except mysql.connector.Error as err:
        print(f"Error fetching messages: {err}")
        return None

def save_message(message):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            INSERT INTO messages (sender_id, receiver_id, text, ticket_id, timestamp, is_deleted_for_sender, is_deleted_for_receiver, is_read)
            VALUES (%s, %s, %s, %s, NOW(), 0, 0, 0)
        """
        cursor.execute(query, (
            message["sender_id"],
            message["receiver_id"],
            message["text"],
            message.get("ticket_id")
        ))
        conn.commit()

        # Fetch the just-inserted message using its ID
        message_id = cursor.lastrowid
        cursor.execute("""
            SELECT sender_id, receiver_id, text, timestamp, ticket_id,is_read
            FROM messages
            WHERE id = %s
        """, (message_id,))
        saved_message = cursor.fetchone()

        cursor.close()
        conn.close()
        return saved_message if saved_message else False
    except mysql.connector.Error as err:
        print(f"Database error while saving message: {err}")
        return False

  
def clear_messages_for_user(user_id, contact_id):
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        print(f"Clearing for user_id={user_id}, contact_id={contact_id}")
        # Update messages where user_id is the sender
        cursor.execute(
            "UPDATE messages SET is_deleted_for_sender = 1 WHERE sender_id = %s AND receiver_id = %s",
            (user_id, contact_id)
        )
        print(f"Rows affected (sender): {cursor.rowcount}")
        # Update messages where user_id is the receiver
        cursor.execute(
            "UPDATE messages SET is_deleted_for_receiver = 1 WHERE sender_id = %s AND receiver_id = %s",
            (contact_id, user_id)
        )
        print(f"Rows affected (receiver): {cursor.rowcount}")
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error clearing messages: {e}")
        return False
    
    
def get_unread_counts(requesting_user_id):
    """Fetch the count of unread messages for each contact of the requesting user."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                CASE 
                    WHEN sender_id = %s THEN receiver_id 
                    ELSE sender_id 
                END AS contact_id,
                COUNT(*) AS unread_count
            FROM messages
            WHERE (sender_id = %s OR receiver_id = %s)
            AND receiver_id = %s
            AND is_read = 0
            AND is_deleted_for_receiver = 0
            GROUP BY contact_id
        """
        params = (requesting_user_id, requesting_user_id, requesting_user_id, requesting_user_id)
        cursor.execute(query, params)
        unread_counts = {row["contact_id"]: row["unread_count"] for row in cursor.fetchall()}
        cursor.close()
        conn.close()
        return unread_counts
    except mysql.connector.Error as err:
        print(f"Error fetching unread counts: {err}")
        return {}
    
def mark_messages_as_read(user_id, contact_id):
    """Mark messages from contact_id to user_id as read."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            UPDATE messages 
            SET is_read = 1 
            WHERE sender_id = %s AND receiver_id = %s AND is_read = 0 AND is_deleted_for_receiver = 0
        """
        cursor.execute(query, (contact_id, user_id))
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except mysql.connector.Error as err:
        print(f"Error marking messages as read: {err}")
        return False

