import json
import os
from urllib.parse import urlparse
import mysql.connector
from flask import current_app
from ..utils.db_utils import get_db_connection
from datetime import datetime
from datetime import datetime
import mysql.connector
import requests
import firebase_admin
from firebase_admin import credentials, messaging
from datetime import datetime
from firebase_admin import messaging
from backend.utils.db_utils import get_db_connection 
from pywebpush import webpush, WebPushException


VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY")
VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY")
VAPID_EMAIL = os.environ.get("VAPID_EMAIL")
BASE_URL = os.environ.get("BASE_URL", "http://localhost:5173")

def get_notifications_by_receiver(receiver_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT id, sender_id, sender_name, message, timestamp, is_read, type, link_url
            FROM notifications
            WHERE receiver_id = %s
            ORDER BY timestamp DESC;
        """
        cursor.execute(query, (receiver_id,))
        notifications = cursor.fetchall()
        cursor.close()
        conn.close()
        return notifications
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None
    
    
def mark_notification_as_read(notification_id):
    """Mark a notification as read."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "UPDATE notifications SET is_read = TRUE WHERE id = %s"
        cursor.execute(query, (notification_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return False



def create_notification(sender_id, receiver_id, sender_name, message, notification_type="approval"):
    """Insert a new notification into the database"""
    try:
        timestamp = datetime.utcnow()  # Get current timestamp in UTC
        query = """INSERT INTO notifications (sender_id, receiver_id, sender_name, message, timestamp, is_read, type)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)"""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(query, (sender_id, receiver_id, sender_name, message, timestamp, 0, notification_type))  # 0 means not read
        conn.commit()
        return True
    except Exception as e:
        print(f"Error creating notification: {e}")
        conn.rollback()
        return False
    

if not all([VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY, VAPID_EMAIL]):
    raise ValueError("Missing VAPID keys or email in environment variables")

def send_notification(sender_id, receiver_id, sender_name, message, notification_type, link_url=None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "INSERT INTO notifications (sender_id, receiver_id, sender_name, message, type, link_url, timestamp, is_read) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (sender_id, receiver_id, sender_name, message, notification_type, link_url, datetime.now(), 0)
        )
        conn.commit()

        cursor.execute("SELECT subscription FROM push_subscriptions WHERE user_id = %s", (receiver_id,))
        subscription_row = cursor.fetchone()

        if subscription_row:
            subscription_data = json.loads(subscription_row['subscription'])
            print(f"Subscription data: {subscription_data}")
            endpoint = subscription_data.get('endpoint', '')

            if 'fcm.googleapis.com' in endpoint:
                endpoint_origin = 'https://fcm.googleapis.com'  
            else:
                endpoint_origin = urlparse(endpoint).scheme + '://' + urlparse(endpoint).hostname

            vapid_claims = {
                "sub": f"mailto:{VAPID_EMAIL}",
                "aud": endpoint_origin,
            }
            print(f"VAPID claims: {vapid_claims}")  # Debug VAPID claims

            full_link_url = f"{BASE_URL}{link_url}" if link_url else ""
            payload = json.dumps({
                "title": f"Message from {sender_name}",
                "message": message,
                "link_url": full_link_url
            })
            if len(payload.encode('utf-8')) > 3072:
                print(f"Payload too large: {len(payload.encode('utf-8'))} bytes")
                message = message[:100] + "..."
                payload = json.dumps({"title": f"Message from {sender_name}", "message": message, "link_url": full_link_url})

            print(f"Sending payload: {payload}")  # Debug payload
            try:
                response = webpush(
                    subscription_info=subscription_data,
                    data=payload,
                    vapid_private_key=VAPID_PRIVATE_KEY,
                    vapid_claims=vapid_claims
                )
                print(f"Web Push notification sent to user {receiver_id}")
            except WebPushException as e:
                print(f"Error sending Web Push notification: {str(e)} - Full response: {e.response.text}")
        else:
            print(f"No push subscription found for user ID {receiver_id}")
    except Exception as e:
        print(f"Error sending notification: {e}")
    finally:
        cursor.close()
        conn.close()

def approve_or_reject_technician(technician_id, action):
    """
    Approve or reject a technician based on the action ('approve' or 'reject').
    Also initializes metrics in technician_metrics if the action is 'approve'.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Define the query based on the action
        if action == 'approve':
            query = "UPDATE users SET is_approved = 1 WHERE id = %s"
            expected_value = 1
        elif action == 'reject':
            query = "UPDATE users SET is_approved = 0 WHERE id = %s"
            expected_value = 0
        else:
            # Invalid action
            print(f"Invalid action: {action}")
            return False

        # Execute the update query
        cursor.execute(query, (technician_id,))
        conn.commit()

        # Verify the update
        cursor.execute("SELECT COUNT(*) FROM users WHERE id = %s AND is_approved = %s", (technician_id, expected_value))
        affected_rows = cursor.fetchone()[0]

        if action == 'approve' and affected_rows > 0:
            # Insert the technician into the technician_metrics table
            try:
                cursor.execute(
                    "INSERT INTO technician_metrics (technician_id, total_assigned_tickets, total_resolved_tickets, "
                    "today_assigned_tickets, today_resolved_tickets) VALUES (%s, 0, 0, 0, 0)",
                    (technician_id,)
                )
                conn.commit()
                print(f"Technician {technician_id} successfully added to technician_metrics.")
            except Exception as e:
                print(f"Error inserting technician metrics: {e}")
                conn.rollback()

        cursor.close()
        conn.close()

        # Return True if the update was successful
        return affected_rows > 0

    except Exception as e:
        print(f"Error in approving or rejecting technician: {e}")
        return False


def mark_all_notification_as_read(receiver_id):
    """
    Marks all notifications as read for a specific receiver ID.

    :param receiver_id: The ID of the receiver whose notifications should be marked as read.
    :return: True if the operation is successful, False otherwise.
    """
    try:
        # Establish a connection to the database
        conn = get_db_connection()
        cursor = conn.cursor()

        # Update the notifications table
        query = "UPDATE notifications SET is_read = 1 WHERE receiver_id = %s AND is_read = 0"
        cursor.execute(query, (receiver_id,))

        # Commit the transaction
        conn.commit()

        # Check if any rows were updated
        if cursor.rowcount > 0:
            success = True
        else:
            success = False

        # Close the cursor and connection
        cursor.close()
        conn.close()

        return success

    except mysql.connector.Error as err:
        print(f"MySQL error: {err}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False



def get_unread_notifications_count_by_userid(user_id):
    try:
        # Establish a connection to the database
        connection =get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # SQL query to fetch the unread notification count for the specific user
        query = """
            SELECT COUNT(*) AS unread_count
            FROM notifications
            WHERE receiver_id = %s AND is_read = 0
        """
        
        # Execute the query with the user_id as parameter
        cursor.execute(query, (user_id,))
        
        # Fetch the result
        result = cursor.fetchone()
        
        # Return the unread count
        return result['unread_count'] if result else 0
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return 0
    finally:
        # Close the cursor and the connection
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def delete_notifications_by_receiver(receiver_id):
    """
    Delete all notifications for a specific receiver.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Delete notifications for the given receiver_id
        query = "DELETE FROM notifications WHERE receiver_id = %s"
        cursor.execute(query, (receiver_id,))
        conn.commit()

        cursor.close()
        conn.close()
        return True
    except mysql.connector.Error as err:
        print(f"Database error while deleting notifications: {err}")
        return False



    def save_token_in_db(fcm_token):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            # Insert or update the token in the table
            query = """
                INSERT INTO fcm_tokens (fcm_token)
                VALUES (%s)
                ON DUPLICATE KEY UPDATE fcm_token = VALUES(fcm_token);
            """
            cursor.execute(query, (fcm_token,))
            conn.commit()
        except mysql.connector.Error as err:
            print(f"Error: {err}")
        finally:
            if conn.is_connected():
                cursor.close()
                conn.close()


def save_fcm_token_to_db(user_id, fcm_token):
    """
    Inserts or updates the FCM token in the database for the specified user ID.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO fcm_tokens (user_id, fcm_token)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE fcm_token = VALUES(fcm_token)
        """
        cursor.execute(query, (user_id, fcm_token))
        conn.commit()
    except Exception as e:
        # Handle or re-raise the exception to the controller
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
