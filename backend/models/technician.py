import mysql

from backend.models.user import assign_ticket_to_technician
from ..utils.db_utils import get_db_connection
from datetime import datetime, timedelta



def fetch_unapproved_technicians_from_db():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = "SELECT id, name, email FROM users WHERE role = %s AND is_approved = %s"
        cursor.execute(query, ('technician', False))
        result = cursor.fetchall()

        cursor.close()
        connection.close()

        return result
    except Exception as e:
        raise Exception(f"Database error: {str(e)}")
    
def fetch_approved_technicians_from_db():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.phoneNumber,
                COALESCE(tm.total_assigned_tickets, 0) AS total_assigned_tickets,
                COALESCE(tm.total_resolved_tickets, 0) AS total_resolved_tickets
            FROM users u
            LEFT JOIN technician_metrics tm ON u.id = tm.technician_id
            WHERE u.role = %s AND u.is_approved = %s
        """
        cursor.execute(query, ('technician', True))
        result = cursor.fetchall()

        cursor.close()
        connection.close()

        return result
    except Exception as e:
        raise Exception(f"Database error: {str(e)}")
def update_technician_approval_status(technician_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        query = "UPDATE users SET isApproved = %s WHERE id = %s AND role = %s"
        cursor.execute(query, (True, technician_id, 'technician'))

        connection.commit()
        cursor.close()
        connection.close()
    except Exception as e:
        raise Exception(f"Database error: {str(e)}")


def fetch_technician_stats(technician_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Fetch overall stats from technician_metrics table (Precomputed for efficiency)
        cursor.execute("""
            SELECT 
                total_assigned_tickets AS totalTickets,
                today_resolved_tickets AS resolvedToday,
                current_assigned_tickets AS inProgressTickets
            FROM technician_metrics 
            WHERE technician_id = %s
        """, (technician_id,))
        stats = cursor.fetchone()

        # Fetch high-priority pending tickets directly from tickets table
        cursor.execute("""
            SELECT COUNT(*) AS highPriorityPending
            FROM ticket_mapping tm
            JOIN tickets t ON tm.ticket_id = t.ticket_id
            WHERE tm.technician_id = %s 
              AND t.priority = 'High' 
              AND t.status IN ('Assigned', 'In Progress')
        """, (technician_id,))
        high_priority_data = cursor.fetchone()
        stats["highPriorityPending"] = high_priority_data["highPriorityPending"]

        # Fetch chart data - Ticket count grouped by status
        cursor.execute("""
            SELECT t.status, COUNT(*) AS count
            FROM ticket_mapping tm
            JOIN tickets t ON tm.ticket_id = t.ticket_id
            WHERE tm.technician_id = %s
            GROUP BY t.status
        """, (technician_id,))
        chart_data = cursor.fetchall()

        return stats, chart_data

    finally:
        cursor.close()
        conn.close()



def fetch_all_tickets_from_db(technician_id):
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
            u.id,
            u.name AS user_name,
            u.phoneNumber AS user_phone_number,
            GROUP_CONCAT(a.file_path SEPARATOR ', ') AS attachments
        FROM tickets t
        INNER JOIN ticket_mapping tm ON t.ticket_id = tm.ticket_id
        INNER JOIN users u ON tm.user_id = u.id
        LEFT JOIN attachments a ON t.ticket_id = a.ticket_id
        WHERE tm.technician_id = %s
        GROUP BY t.ticket_id, tm.started_time, tm.closure_time, tm.sla_deadline, tm.assigned_by_admin, 
                 u.name, u.phoneNumber,u.id
        """

        cursor.execute(query, (technician_id,))
        tickets = cursor.fetchall()

        cursor.close()
        conn.close()
        return tickets
    except mysql.connector.Error as err:
        print("Error:", err)
        return None


def update_ticket_status_in_db(ticket_id, status):
    try:
        # Connect to MySQL database
        connection =get_db_connection()
        
        cursor = connection.cursor()

        # Update query to set status of the ticket
        update_query = """
        UPDATE tickets
        SET status = %s
        WHERE ticket_id = %s
        """
        
        cursor.execute(update_query, (status, ticket_id))
        connection.commit()

        cursor.close()
        connection.close()

        return True
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return False

def fetch_assigned_tickets_from_db(technician_id):
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
            u.id AS user_id,
            u.name AS user_name,
            u.phoneNumber AS user_phone_number,
            GROUP_CONCAT(a.file_path SEPARATOR ', ') AS attachments
        FROM tickets t
        INNER JOIN ticket_mapping tm ON t.ticket_id = tm.ticket_id
        INNER JOIN users u ON tm.user_id = u.id
        LEFT JOIN attachments a ON t.ticket_id = a.ticket_id
        WHERE tm.technician_id = %s AND t.status IN ('assigned', 'in progress')
        GROUP BY t.ticket_id, tm.started_time, tm.closure_time, tm.sla_deadline, tm.assigned_by_admin, 
                 u.name, u.phoneNumber, u.id
        """

        cursor.execute(query, (technician_id,))
        tickets = cursor.fetchall()

        cursor.close()
        conn.close()
        return tickets
    except mysql.connector.Error as err:
        print("Error:", err)
        return None

def fetch_all_inventory_from_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT 
            i.id,
            i.item_name,
            i.description,
            i.quantity,
            i.created_at
        FROM inventory i
        """

        cursor.execute(query)
        inventory_items = cursor.fetchall()

        cursor.close()
        conn.close()
        return inventory_items
    except mysql.connector.Error as err:
        print("Error:", err)
        return None
 
def save_spares_request(ticket_id, technician_id, items):
    try:
        # Connect to MySQL database
        connection = get_db_connection()
        cursor = connection.cursor()

        # Insert query for spare requests
        insert_query = """
        INSERT INTO spare_requests (ticket_id, technician_id, part_id, quantity, approval_status, requested_at)
        VALUES (%s, %s, %s, %s, 'Pending', CURRENT_TIMESTAMP)
        """

        # Insert each requested item into the spare_requests table
        for item in items:
            cursor.execute(insert_query, (ticket_id, technician_id, item['itemId'], item['quantity']))

        # Commit transaction
        connection.commit()

        cursor.close()
        connection.close()

        return True
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return False


def fetch_requested_spares_from_db(ticket_id):
    try:
        # Connect to MySQL database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Query to fetch requested spares along with item details
        query = """
        SELECT sr.request_id, sr.ticket_id, sr.technician_id, sr.part_id, i.item_name, sr.quantity, 
               sr.approval_status, sr.requested_at, sr.approved_by, sr.approved_at
        FROM spare_requests sr
        JOIN inventory i ON sr.part_id = i.id
        WHERE sr.ticket_id = %s
        """

        cursor.execute(query, (ticket_id,))
        requested_spares = cursor.fetchall()

        cursor.close()
        connection.close()

        return requested_spares
    except mysql.connector.Error as err:
        print(f"Error fetching requested spares: {err}")
        return None


def close_ticket_in_db(ticket_id, status, closure_log, technician_id):
    connection = None
    cursor = None
    try:
        # Connect to MySQL database
        connection = get_db_connection()
        cursor = connection.cursor()

        # Start a transaction to ensure ACID properties
        connection.start_transaction()

        # Step 1: Insert closure log into closure_logs table
        insert_log_query = """
        INSERT INTO closure_logs (log, timestamp)
        VALUES (%s, %s)
        """
        cursor.execute(insert_log_query, (closure_log, datetime.now()))
        log_id = cursor.lastrowid  # Get the auto-incremented log_id

        # Step 2: Check if the ticket is an emergency ticket and update status
        check_emergency_query = """
        SELECT is_emergency
        FROM tickets
        WHERE ticket_id = %s
        """
        cursor.execute(check_emergency_query, (ticket_id,))
        result = cursor.fetchone()
        if not result:
            connection.rollback()
            print(f"No ticket found with ticket_id: {ticket_id}")
            return False
        is_emergency = result[0]

        update_ticket_status_query = """
        UPDATE tickets
        SET status = %s
        WHERE ticket_id = %s
        """
        cursor.execute(update_ticket_status_query, (status, ticket_id))
        if cursor.rowcount == 0:
            connection.rollback()
            print(f"No ticket updated for ticket_id: {ticket_id}")
            return False

        # Step 3: Update closure_time and log_id in ticket_mapping table
        update_ticket_mapping_query = """
        UPDATE ticket_mapping
        SET closure_time = %s,
            log_id = %s
        WHERE ticket_id = %s AND technician_id = %s
        """
        cursor.execute(update_ticket_mapping_query, (datetime.now(), log_id, ticket_id, technician_id))
        if cursor.rowcount == 0:
            connection.rollback()
            print(f"No ticket mapping found for ticket_id: {ticket_id} and technician_id: {technician_id}")
            return False

        # Step 4: Update technician_metrics based on is_emergency
        if is_emergency == 1:
            update_metrics_query = """
            UPDATE technician_metrics
            SET total_resolved_tickets = total_resolved_tickets + 1,
                today_resolved_tickets = today_resolved_tickets + 1,
                current_assigned_tickets = current_assigned_tickets - 1,
                sla_breached_slot = 0
            WHERE technician_id = %s
            """
        else:
            update_metrics_query = """
            UPDATE technician_metrics
            SET total_resolved_tickets = total_resolved_tickets + 1,
                today_resolved_tickets = today_resolved_tickets + 1,
                current_assigned_tickets = current_assigned_tickets - 1
            WHERE technician_id = %s
            """
        cursor.execute(update_metrics_query, (technician_id,))
        if cursor.rowcount == 0:
            connection.rollback()
            print(f"No metrics found for technician_id: {technician_id}")
            return False

        # Commit the transaction
        connection.commit()
        assign_unassigned_tickets()
        return True

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        if connection:
            connection.rollback()
        return False
    except Exception as e:
        print(f"Error: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def assign_unassigned_tickets():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Fetch all unassigned tickets, ordered by priority (High > Medium > Low)
        cursor.execute("""
            SELECT ticket_id, priority, user_id
            FROM tickets
            WHERE status = 'Open'
            AND ticket_id NOT IN (SELECT ticket_id FROM ticket_mapping WHERE closure_time IS NULL)
            ORDER BY FIELD(priority, 'High', 'Medium', 'Low')
        """)
        unassigned_tickets = cursor.fetchall()

        for ticket in unassigned_tickets:
            ticket_id, priority, user_id = ticket
            # Calculate SLA deadline (consistent with new_ticket_creator)
            priority_sla = {'high': 2, 'medium': 5, 'low': 36}
            sla_hours = priority_sla.get(priority.lower(), 36)
            sla_deadline = datetime.now() + timedelta(hours=sla_hours)

            # Assign the ticket using existing function
            assign_ticket_to_technician(ticket_id, user_id, priority, sla_deadline)

        connection.commit()
        return True

    except Exception as e:
        print(f"Error assigning tickets: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


