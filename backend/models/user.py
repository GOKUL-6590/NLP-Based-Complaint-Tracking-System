import json
import cloudinary
import mysql.connector
from werkzeug.security import generate_password_hash
from datetime import date, datetime
from backend.models.notifications import send_notification
from ..utils.db_utils import get_db_connection
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
import base64
from io import BytesIO
from cloudinary import uploader
from werkzeug.utils import secure_filename

cloudinary.config(
    cloud_name="dhenxgofs",  # Replace with your Cloud name
    api_key="316433455823366",        # Replace with your API Key
    api_secret= "fQ441adO1OI_Rr8zhGpOFHTodAI" 
)
def update_user_password(email, new_hashed_password):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("UPDATE users SET password = %s WHERE email = %s", (new_hashed_password, email))
        conn.commit()

    except mysql.connector.Error as err:
        print(f"Error updating password: {err}")

    finally:
        cursor.close()
        conn.close()


def create_user(name, email, password, role, phone_number, is_approved=True):
    try:
        # Hash the password before storing it

        conn = get_db_connection()
        cursor = conn.cursor()

        # Include isApproved field in the INSERT query
        cursor.execute("""
            INSERT INTO users (name, email, password, role, phoneNumber, is_approved)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (name, email, password, role, phone_number, is_approved))

        conn.commit()

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return False  # Handle the error properly (you can also raise exceptions)

    finally:
        cursor.close()
        conn.close()

    return True  # Return success status

def get_user_by_email(email):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None  # Handle the error properly (you can also raise exceptions)

    finally:
        cursor.close()
        conn.close()

    return user  # Will return None if user doesn't exist

def get_user_by_id(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

    finally:
        cursor.close()
        conn.close()

    return user

def update_user_password(user_id, hashed_password):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Update the password for the user with the given ID
        query = "UPDATE users SET password = %s WHERE id = %s"
        cursor.execute(query, (hashed_password.decode('utf-8'), user_id))  # Decode bytes to string for varchar
        conn.commit()

        # Check if any rows were affected (i.e., user exists)
        if cursor.rowcount == 0:
            return False

        return True

    except mysql.connector.Error as err:
        print(f"Error updating password: {err}")
        return False

    finally:
        cursor.close()
        conn.close()

def get_all_admins():
    """Fetch all admin users from the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = "SELECT id, name FROM users WHERE role = 'admin'"
        cursor.execute(query)
        admins = cursor.fetchall()
        return admins
    except Exception as e:
        print(f"Error fetching admins: {e}")
        return []


def create_new_ticket(data):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Start transaction to ensure atomicity
        connection.start_transaction()

        # Insert ticket details into the 'tickets' table (without specifying ticket_id)
        query = """
            INSERT INTO tickets (system_number, venue, block, category, description, status, priority)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['systemNumber'],
            data['venue'],
            data['block'],
            data['category'],
            data['description'],
            data['status'],
            data['priority']
        )
        cursor.execute(query, values)

        # Commit ticket insert first so that the trigger can generate ticket_id
        connection.commit()

        # Now query the database to get the generated ticket_id
        cursor.execute("SELECT ticket_id FROM tickets ORDER BY created_at DESC LIMIT 1")
        ticket_id = cursor.fetchone()[0]

        # Handle attachments (if any)
        attachments = data.get('attachments')

        if attachments and isinstance(attachments, list):
            for base64_file in attachments:
                try:
                    if not base64_file:  # Skip empty values
                        continue

                    # Decode the base64 string
                    file_data = base64.b64decode(base64_file.split(",")[1])  # Remove prefix if it exists
                    file_name = "attachment"  # Default file name

                    # Upload to Cloudinary
                    upload_result = uploader.upload(BytesIO(file_data), folder='ticket-attachments')

                    # Store file metadata in the database with the correct ticket_id
                    cursor.execute(
                        """
                        INSERT INTO attachments (ticket_id, file_name, file_path)
                        VALUES (%s, %s, %s)
                        """,
                        (
                            ticket_id,
                            file_name,
                            upload_result.get('secure_url')
                        )
                    )

                except Exception as e:
                    print(f"Error uploading attachment: {e}")
                    continue  # Continue with the next attachment

        # Commit the transaction if everything is successful
        connection.commit()
        return ticket_id

    except Exception as e:
        print(f"Error in model: {e}")
        if connection:
            connection.rollback()  # Rollback in case of error
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def assign_ticket_to_technician(ticket_id, userid, priority, sla_deadline):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Start transaction to ensure atomicity
        connection.start_transaction()

        # Try to find an available technician
        cursor.execute("""
            SELECT technician_id, current_assigned_tickets
            FROM technician_metrics
            WHERE current_assigned_tickets < 2
            ORDER BY today_assigned_tickets ASC, current_assigned_tickets ASC
            LIMIT 1
        """)
        technician = cursor.fetchone()

        if technician:
            technician_id = technician[0]
            cursor.execute("SELECT name FROM users WHERE id = %s", (technician_id,))
            result = cursor.fetchone()
            technician_name = result[0] if result else None

            # Assign ticket to the technician
            cursor.execute("""
                INSERT INTO ticket_mapping (ticket_id, user_id, technician_id, started_time, sla_deadline)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP, %s)
            """, (ticket_id, userid, technician_id, sla_deadline))

            # Update ticket status to 'Assigned'
            cursor.execute("""
                UPDATE tickets 
                SET status = 'Assigned' 
                WHERE ticket_id = %s
            """, (ticket_id,))

            # Update technician's metrics
            cursor.execute("""
                UPDATE technician_metrics
                SET total_assigned_tickets = total_assigned_tickets + 1,
                    today_assigned_tickets = today_assigned_tickets + 1,
                    current_assigned_tickets = current_assigned_tickets + 1
                WHERE technician_id = %s
            """, (technician_id,))

            connection.commit()

            # Send notifications to both technician and user
            link_url = "/technician/assigned-tickets"
            send_notification(
                sender_id=userid,
                receiver_id=technician_id,
                sender_name='System',
                message=f"You have been assigned a new ticket (ID: {ticket_id}) with priority: {priority}.",
                notification_type='Technician Assignment',
                link_url=link_url
            )

            link_url = f"/ticket/{ticket_id}"
            send_notification(
                sender_id=userid,
                receiver_id=userid,
                sender_name='System',
                message=f"Your ticket (ID: {ticket_id}) has been assigned to technician {technician_name}.",
                notification_type='Ticket Assignment',
                link_url=link_url
            )
            print(f"Ticket {ticket_id} assigned to technician {technician_name}. Status updated to 'Assigned'.")

        else:
            # Insert the ticket with a NULL technician_id
            cursor.execute("""
                INSERT INTO ticket_mapping (ticket_id, user_id, technician_id, started_time, sla_deadline)
                VALUES (%s, %s, NULL, CURRENT_TIMESTAMP, %s)
            """, (ticket_id, userid, sla_deadline))

            connection.commit()

            # Send notification to the user
            link_url = f"/ticket/{ticket_id}"
            send_notification(
                sender_id=userid,
                receiver_id=userid,
                sender_name='System',
                message=f"Your ticket (ID: {ticket_id}) has been created but no technician has been assigned yet.",
                notification_type='Ticket Created',
                link_url=link_url
            )

            print(f"Ticket {ticket_id} added to the mapping table without a technician.")

        return True

    except Exception as e:
        print(f"Error assigning ticket to technician: {e}")
        if connection:
            connection.rollback()  # Rollback in case of error
        return False

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_notifications_by_receiver(receiver_id):
    """
    Fetch notifications for a given receiver ID from the database.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT id, sender_id, message, created_at, status
        FROM notifications 
        WHERE receiver_id = %s
        ORDER BY created_at DESC
        """
        cursor.execute(query, (receiver_id,))
        notifications = cursor.fetchall()

        cursor.close()
        conn.close()

        return notifications

    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return None

        
def handle_sla_breached_tickets():
    try:
        connection = get_db_connection()
        connection.autocommit = False  # Start a transaction
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT ticket_id, priority
                FROM ticket_mapping
                WHERE technician_id IS NULL AND NOW() > sla_deadline AND reassigned = 0
            """)
            breached_tickets = cursor.fetchall()

            for ticket_id, priority in breached_tickets:
                cursor.execute("""
                    SELECT technician_id
                    FROM technician_metrics
                    WHERE is_active = 1 AND current_assigned_tickets < 2
                    ORDER BY today_assigned_tickets ASC
                    LIMIT 1
                """)
                technician = cursor.fetchone()

                if technician:
                    technician_id = technician[0]
                    cursor.execute("""
                        UPDATE ticket_mapping
                        SET technician_id = %s, reassigned = 1
                        WHERE ticket_id = %s
                    """, (technician_id, ticket_id))

                    cursor.execute("""
                        UPDATE technician_metrics
                        SET total_assigned_tickets = total_assigned_tickets + 1,
                            today_assigned_tickets = today_assigned_tickets + 1,
                            current_assigned_tickets = current_assigned_tickets + 1
                        WHERE technician_id = %s
                    """, (technician_id,))

            connection.commit()  # Commit the transaction
            print(f"Reassigned {len(breached_tickets)} SLA-breached tickets.")
            return True

    except Exception as e:
        connection.rollback()  # Rollback in case of error
        print(f"Error handling SLA-breached tickets: {e}")
        return False

    finally:
        connection.close()


def get_tickets_stats(user_id):
    """
    Fetch user-specific ticket statistics for the dashboard, using ticket_mapping to find tickets.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        today = date.today().strftime("%Y-%m-%d")

        # Opened today: Count tickets created today and assigned to the user
        cursor.execute("""
            SELECT COUNT(*) as opened_today 
            FROM tickets t
            JOIN ticket_mapping tm ON t.ticket_id = tm.ticket_id
            WHERE DATE(t.created_at) = %s AND tm.user_id = %s
        """, (today, user_id))
        opened_today = cursor.fetchone()["opened_today"]

        # Active tickets: Count tickets in 'Open' or 'In Progress' assigned to the user
        cursor.execute("""
            SELECT COUNT(*) as active_tickets 
            FROM tickets t
            JOIN ticket_mapping tm ON t.ticket_id = tm.ticket_id
            WHERE t.status IN ('Open','Assigned', 'In Progress') AND tm.user_id = %s
        """, (user_id,))
        active_tickets = cursor.fetchone()["active_tickets"]

        # Closed tickets: Count tickets in 'Closed' assigned to the user
        cursor.execute("""
            SELECT COUNT(*) as closed_tickets 
            FROM tickets t
            JOIN ticket_mapping tm ON t.ticket_id = tm.ticket_id
            WHERE t.status = 'Closed' AND tm.user_id = %s
        """, (user_id,))
        closed_tickets = cursor.fetchone()["closed_tickets"]

        # Total tickets: Count all tickets assigned to the user
        cursor.execute("""
            SELECT COUNT(*) as total_tickets 
            FROM tickets t
            JOIN ticket_mapping tm ON t.ticket_id = tm.ticket_id
            WHERE tm.user_id = %s
        """, (user_id,))
        total_tickets = cursor.fetchone()["total_tickets"]

        # Active tickets list: Fetch ticket details for active tickets assigned to the user
        cursor.execute("""
            SELECT 
            t.ticket_id,
            t.system_number,
            t.venue,
            t.block,
            t.category,
            t.description,
            t.status,
            t.priority,
            t.created_at,
            t.last_updated,
            t.is_emergency,
            tm.started_time,
            tm.closure_time,
            tm.sla_deadline,
            tm.assigned_by_admin,
            u.id,
            u.name AS Technician_name,
            u.phoneNumber AS Technician_phone_number,
            GROUP_CONCAT(a.file_path SEPARATOR ', ') AS attachments
        FROM tickets t
        INNER JOIN ticket_mapping tm ON t.ticket_id = tm.ticket_id
        LEFT JOIN attachments a ON t.ticket_id = a.ticket_id
        INNER JOIN users u ON tm.user_id = u.id
        WHERE tm.user_id = %s AND t.status IN ('Open', 'Assigned', 'In Progress')
        GROUP BY t.ticket_id, tm.started_time, tm.closure_time, tm.sla_deadline, tm.assigned_by_admin;
        """, (user_id,))
        active_tickets_list = cursor.fetchall()
        cursor.close()
        conn.close()

        return {
            "opened_today": opened_today,
            "active_tickets": active_tickets,
            "closed_tickets": closed_tickets,
            "total_tickets": total_tickets,
            "active_tickets_list": active_tickets_list
        }

    except Exception as e:
        print(f"Error fetching ticket statistics: {str(e)}")
        return None


def dispute_ticket_in_db(ticket_id):
    """
    Updates the status of a ticket to 'Assigned' to indicate it is being disputed.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Start a transaction
        conn.autocommit = False

        # Check if ticket exists
        cursor.execute("SELECT status FROM tickets WHERE ticket_id = %s", (ticket_id,))
        ticket = cursor.fetchone()

        if not ticket:
            return False

        if ticket["status"] == "Assigned":
            return True

        # Update the ticket status to 'Assigned'
        cursor.execute("""
            UPDATE tickets 
            SET status = 'Assigned', last_updated = CURRENT_TIMESTAMP 
            WHERE ticket_id = %s
        """, (ticket_id,))

        conn.commit()  # Commit the transaction
        cursor.close()
        conn.close()

        return True

    except Exception as e:
        conn.rollback()  # Rollback in case of error
        print(f"Error disputing ticket: {str(e)}")
        return None


def get_tickets_by_userid(userid):
    """
    Retrieves all tickets assigned to a user from the database.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch all tickets associated with the user
        query = """
            SELECT t.ticket_id, t.system_number, t.venue, t.block, t.category, 
                   t.description, t.status, t.priority, t.created_at, 
                   t.last_updated, t.is_emergency, tm.started_time, 
                   tm.closure_time, tm.technician_id, tm.sla_deadline
            FROM tickets t
            JOIN ticket_mapping tm ON t.ticket_id = tm.ticket_id
            WHERE tm.user_id = %s
        """
        cursor.execute(query, (userid,))
        tickets = cursor.fetchall()

        cursor.close()
        conn.close()

        return tickets
    except Exception as e:
        print(f"Error retrieving tickets: {str(e)}")
        return []

def get_ticket_by_id(ticket_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch ticket details with user and technician names
        ticket_query = """
            SELECT 
                t.ticket_id, t.system_number, t.venue, t.block, t.category, 
                t.description, t.status, t.priority, t.created_at, t.last_updated, t.is_emergency,
                tm.id AS mapping_id, tm.user_id, tm.technician_id, tm.started_time, tm.closure_time, 
                tm.assigned_by_admin, tm.sla_deadline,tm.log_id,
                u.name AS user_name,
                tech.name AS technician_name
            FROM tickets t
            LEFT JOIN ticket_mapping tm ON t.ticket_id = tm.ticket_id
            LEFT JOIN users u ON tm.user_id = u.id
            LEFT JOIN users tech ON tm.technician_id = tech.id
            WHERE t.ticket_id = %s
        """
        cursor.execute(ticket_query, (ticket_id,))
        ticket = cursor.fetchone()

        if not ticket:
            cursor.close()
            conn.close()
            return None  # No ticket found

        # Fetch attachments
        attachments_query = """
            SELECT id, ticket_id, file_name, file_path, uploaded_at
            FROM attachments
            WHERE ticket_id = %s
        """
        cursor.execute(attachments_query, (ticket_id,))
        attachments = cursor.fetchall()

        # Fetch spare requests with item_name from inventory
        spares_query = """
            SELECT 
                sr.request_id, sr.ticket_id, sr.technician_id, sr.quantity, 
                sr.approval_status, sr.requested_at, sr.approved_by, sr.approved_at, sr.part_id,
                u.name AS approved_by_name,
                i.item_name AS part_name
            FROM spare_requests sr
            LEFT JOIN users u ON sr.approved_by = u.id
            LEFT JOIN inventory i ON sr.part_id = i.id
            WHERE sr.ticket_id = %s
        """
        cursor.execute(spares_query, (ticket_id,))
        spare_requests = cursor.fetchall()

        # Fetch closure logs (via log_id from ticket_mapping)
        closure_logs_query = """
            SELECT cl.log_id, cl.log, cl.timestamp
            FROM closure_logs cl
            WHERE cl.log_id = %s
        """
        log_id = ticket.get('log_id')  # Assuming ticket_mapping has a log_id field
        closure_logs = []
        if log_id:
            cursor.execute(closure_logs_query, (log_id,))
            closure_logs = cursor.fetchall()

        # Fetch ticket feedback
        feedback_query = """
            SELECT 
                tf.feedback_id, tf.ticket_id, tf.user_id, tf.technician_id, 
                tf.rating, tf.comments, tf.submitted_at,
                u.name AS feedback_user_name,
                tech.name AS feedback_technician_name
            FROM ticket_feedback tf
            LEFT JOIN users u ON tf.user_id = u.id
            LEFT JOIN users tech ON tf.technician_id = tech.id
            WHERE tf.ticket_id = %s
        """
        cursor.execute(feedback_query, (ticket_id,))
        feedback = cursor.fetchall()

        # Combine all data into a single dictionary
        ticket_details = {
            "ticket": ticket,
            "attachments": attachments,
            "spare_requests": spare_requests,
            "closure_logs": closure_logs,
            "feedback": feedback
        }

        cursor.close()
        conn.close()
        return ticket_details

    except Exception as e:
        print(f"Error retrieving ticket details: {str(e)}")
        return None

def store_push_subscription(user_id, subscription):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO push_subscriptions (user_id, subscription)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE subscription = %s
            """,
            (user_id, json.dumps(subscription), json.dumps(subscription))
        )
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error storing push subscription: {str(e)}")
        return False


def submit_ticket_feedback(ticket_id, user_id, technician_id, feedback, rating=None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO ticket_feedback (ticket_id, user_id, technician_id, comments, rating)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (ticket_id, user_id, technician_id, feedback, rating)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def get_ticket_details(ticket_id):
  
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT ticket_id FROM tickets WHERE ticket_id = %s", (ticket_id,))
        ticket = cursor.fetchone()
        if not ticket:
            print(f"Ticket {ticket_id} not found in tickets table.")
            return None

        cursor.execute("""
            SELECT user_id, technician_id 
            FROM ticket_mapping 
            WHERE ticket_id = %s
        """, (ticket_id,))
        ticket_mapping = cursor.fetchone()

        cursor.close()
        conn.close()

        return ticket_mapping

    except Exception as e:
        print(f"Error fetching ticket details: {str(e)}")
        return None 
