from backend.models.notifications import send_notification
from backend.utils.db_utils import get_db_connection
from datetime import datetime

def get_all_users_from_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT id, name FROM users WHERE role = 'user'")
        users = cursor.fetchall()

        cursor.close()
        conn.close()
        return users
    except Exception as e:
        print(f"Database error fetching users: {e}")
        return []

def fetch_dashboard_metrics():
    connection = get_db_connection()
    cursor = connection.cursor()

    # Example queries (modify as per actual schema)
    cursor.execute("SELECT COUNT(*) FROM users where role='user'")
    total_users = cursor.fetchone()[0]


    cursor.execute("SELECT COUNT(*) FROM tickets WHERE status in ('Open','Assigned')")
    open_tickets = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tickets WHERE status='Closed'")
    resolved_tickets = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tickets WHERE status='In Progress'")
    pending_tickets = cursor.fetchone()[0]

    connection.close()

    return {
        "total_users": total_users,
        "open_tickets": open_tickets,
        "resolved_tickets": resolved_tickets,
        "pending_tickets": pending_tickets,
    }

def get_assigned_tickets_from_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
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
            tm.user_id AS assigned_user_id,
            u.id AS user_id,
            u.name AS user_name,
            u.phoneNumber AS user_phone_number,
            tech.id AS technician_id,
            tech.name AS technician_name,
            tech.phoneNumber AS technician_phone_number,
            GROUP_CONCAT(a.file_path SEPARATOR ', ') AS attachments
        FROM tickets t
        JOIN ticket_mapping tm ON t.ticket_id = tm.ticket_id
        JOIN users u ON tm.user_id = u.id
        JOIN users tech ON tm.technician_id = tech.id
        LEFT JOIN attachments a ON t.ticket_id = a.ticket_id
        WHERE tm.technician_id IS NOT NULL
        GROUP BY 
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
            tm.user_id, 
            u.id,      
            u.name,      
            u.phoneNumber,
            tech.id,     
            tech.name,   
            tech.phoneNumber;
        """
        
        cursor.execute(query)  # No need for multi=True here
        tickets = cursor.fetchall()

        cursor.close()
        conn.close()
        return tickets
    except Exception as e:
        print(f"Error fetching assigned tickets: {e}")
        return []


def get_unassigned_tickets_from_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
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
    tm.user_id,
    tm.technician_id,
    tm.started_time,
    tm.closure_time,
    tm.sla_deadline,
    tm.assigned_by_admin,
    u.id AS user_id,
    u.name AS user_name,
    u.phoneNumber AS user_phone_number,
    GROUP_CONCAT(a.file_path SEPARATOR ', ') AS attachments
FROM tickets t
LEFT JOIN ticket_mapping tm ON t.ticket_id = tm.ticket_id
LEFT JOIN users u ON tm.user_id = u.id
LEFT JOIN attachments a ON t.ticket_id = a.ticket_id
WHERE tm.technician_id IS NULL
GROUP BY 
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
    tm.user_id,
    tm.technician_id,
    tm.started_time,
    tm.closure_time,
    tm.sla_deadline,
    tm.assigned_by_admin,
    u.id,
    u.name,
    u.phoneNumber
ORDER BY FIELD(t.priority, 'High', 'Medium', 'Low');


        """
        cursor.execute(query)
        tickets = cursor.fetchall()

        # Convert datetime objects to string
        for ticket in tickets:
            for key, value in ticket.items():
                if isinstance(value, datetime):
                    ticket[key] = value.isoformat()  # Convert datetime to ISO format string

        cursor.close()
        conn.close()
        return tickets
    except Exception as e:
        print(f"Error fetching unassigned tickets: {e}")
        return []



def get_available_technicians_from_db():
    try:
        # Establish a connection to the database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # SQL query to find technicians with a free slot and SLA-breached slot
        query = """
        SELECT tm.technician_id, u.name AS technician_name,                 
                tm.current_assigned_tickets, 
                tm.sla_breached_slot
        FROM technician_metrics tm
        JOIN users u ON tm.technician_id = u.id
        WHERE tm.current_assigned_tickets < 2 
           OR tm.sla_breached_slot = 0;
        """

        cursor.execute(query)
        technicians = cursor.fetchall()

        # Close the cursor and connection
        cursor.close()
        conn.close()

        return technicians

    except Exception as e:
        print(f"Error fetching available technicians: {e}")
        return []

def assign_ticket_to_technician_by_admin(ticket_id, technician_id, assign_type):
    try:
        # Set up the database connection
        connection = get_db_connection()

        if connection.is_connected():
            cursor = connection.cursor()

            # Start a transaction
            connection.start_transaction()

            # Assign the ticket to the technician
            query = """
                UPDATE ticket_mapping 
                SET technician_id = %s, assigned_by_admin = 1 
                WHERE ticket_id = %s
            """
            cursor.execute(query, (technician_id, ticket_id))

            # Update the ticket status to "Assigned"
            update_status_query = """
                UPDATE tickets
                SET status = 'Assigned' , is_emergency = 1
                WHERE ticket_id = %s
            """
            cursor.execute(update_status_query, (ticket_id,))

            # Get the user_id who created the ticket
            get_user_query = """
                SELECT user_id FROM ticket_mapping 
                WHERE ticket_id = %s
            """
            cursor.execute(get_user_query, (ticket_id,))
            user_id = cursor.fetchone()

            if user_id:
                user_id = user_id[0]  # Fetch the user_id from the query result

                # Send notification to the user who created the ticket
                send_notification(
                    sender_id=1,  # Assuming 1 is the admin/system user
                    receiver_id=user_id,
                    sender_name="Admin",
                    message=f"Your ticket (ID: {ticket_id}) has been assigned to a technician.",
                    notification_type="user_status"
                )

            # Update technician metrics
            if assign_type == 'regular':
                update_metrics_query = """
                    UPDATE technician_metrics
                    SET total_assigned_tickets = total_assigned_tickets + 1,
                        today_assigned_tickets = today_assigned_tickets + 1,
                        current_assigned_tickets = current_assigned_tickets + 1
                    WHERE technician_id = %s
                """
                cursor.execute(update_metrics_query, (technician_id,))
            elif assign_type == 'sla':
                update_metrics_query = """
                    UPDATE technician_metrics
                    SET total_assigned_tickets = total_assigned_tickets + 1,
                        today_assigned_tickets = today_assigned_tickets + 1,
                        sla_breached_slot = 1
                    WHERE technician_id = %s
                """
                cursor.execute(update_metrics_query, (technician_id,))

            # Send notification to the technician
            send_notification(
                sender_id=1,  # Assuming 1 is the admin/system user
                receiver_id=technician_id,
                sender_name="Admin",
                message=f"You have been assigned ticket (ID: {ticket_id}).",
                notification_type="technician_status"
            )

            # Commit the transaction if all queries were successful
            connection.commit()

            # Check if the update was successful
            if cursor.rowcount > 0:
                return True
            else:
                return False

    except Exception as e:
        # Rollback all changes if any error occurs
        connection.rollback()
        print(f"Error: {e}")
        raise Exception("Database operation failed")

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_all_tickets():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
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
            u.name AS user_name,
            tech.name AS technician_name
        FROM tickets t
        LEFT JOIN ticket_mapping tm ON t.ticket_id = tm.ticket_id
        LEFT JOIN users u ON tm.user_id = u.id
        LEFT JOIN users tech ON tm.technician_id = tech.id
        ORDER BY t.created_at DESC
        """

        cursor.execute(query)
        tickets = cursor.fetchall()

        cursor.close()
        conn.close()
        return tickets
    except Exception as err:
        print("Error:", err)
        return []
 

def get_all_technician_metrics_from_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT 
            tm.technician_id,
            u.name AS technician_name,
            tm.total_assigned_tickets,
            tm.total_resolved_tickets,
            tm.today_assigned_tickets,
            tm.current_assigned_tickets,
            tm.today_resolved_tickets,
            tm.sla_breached_slot,
            tm.last_updated
        FROM technician_metrics tm
        LEFT JOIN users u ON tm.technician_id = u.id
        ORDER BY tm.last_updated DESC
        """

        cursor.execute(query)
        technician_metrics = cursor.fetchall()

        cursor.close()
        conn.close()
        return technician_metrics
    except Exception as err:
        print("Error:", err)
        return []

def add_item_to_inventory_model(item_data):
    try:
        # Set up the database connection
        connection = get_db_connection()

        if connection.is_connected():
            cursor = connection.cursor()

            # Start a transaction
            connection.start_transaction()

            # Insert new item into the inventory table
            query = """
                INSERT INTO inventory (item_name, description, quantity, added_by)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query, (
                item_data['name'],
                item_data['description'],
                item_data['quantity'],
                item_data['added_by']
            ))

            # Commit the transaction if the insert is successful
            connection.commit()

            # Check if the insertion was successful
            if cursor.rowcount > 0:
                return True
            else:
                return False

    except Exception as e:
        # Rollback all changes if any error occurs
        connection.rollback()
        print(f"Error: {e}")
        raise Exception("Database operation failed")

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_all_inventory_items_from_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT 
            i.id,
            i.item_name,
            i.description,
            i.quantity,
            i.added_by,
            i.created_at,
            u.name AS added_by_name
        FROM inventory i
        LEFT JOIN users u ON i.added_by = u.id
        ORDER BY i.created_at DESC
        """

        cursor.execute(query)
        inventory_items = cursor.fetchall()

        cursor.close()
        conn.close()
        return inventory_items
    except Exception as err:
        print("Error:", err)
        return []


def get_all_spare_requests_from_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT 
            sr.ticket_id,
            sr.technician_id,
            t.name AS technician_name,
            GROUP_CONCAT(sr.request_id) AS request_ids,
            GROUP_CONCAT(i.item_name SEPARATOR ', ') AS items,
            GROUP_CONCAT(sr.part_id) AS part_ids,
            GROUP_CONCAT(sr.quantity) AS quantities,
            sr.approval_status,
            sr.requested_at
        FROM spare_requests sr
        JOIN users t ON sr.technician_id = t.id
        JOIN inventory i ON sr.part_id = i.id
        WHERE sr.approval_status = 'Pending'
        GROUP BY sr.ticket_id, sr.technician_id, sr.approval_status, sr.requested_at
        ORDER BY sr.requested_at DESC
        """

        cursor.execute(query)
        spare_requests = cursor.fetchall()

        cursor.close()
        conn.close()
        return spare_requests
    except Exception as err:
        print("Error fetching grouped requests:", err)
        return []


def update_spare_request_status_model(request_id, status, user_id, ticket_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Update the request status
        update_query = """
        UPDATE spare_requests
        SET approval_status = %s, approved_by = %s, approved_at = NOW()
        WHERE ticket_id = %s AND approval_status = 'Pending'
        """
        cursor.execute(update_query, (status, user_id, ticket_id))

        # If request is approved, reduce inventory quantity
        if status == "Approved":
            reduce_inventory_query = """
            UPDATE inventory i
            JOIN spare_requests sr ON i.id = sr.part_id
            SET i.quantity = i.quantity - sr.quantity
            WHERE sr.ticket_id = %s AND sr.approval_status = 'Approved'
            """
            cursor.execute(reduce_inventory_query, (ticket_id,))

        conn.commit()
        cursor.close()
        conn.close()

        return {"request_id": request_id, "status": status, "updated_by": user_id}

    except Exception as e:
        print(f"Database error: {e}")
        return None


