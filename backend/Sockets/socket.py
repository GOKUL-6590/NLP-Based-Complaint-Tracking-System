from flask_socketio import SocketIO, emit
from backend.models.admin import get_assigned_tickets_from_db, get_unassigned_tickets_from_db
from backend.models.notifications import get_unread_notifications_count_by_userid
from backend.models.technician import fetch_all_tickets_from_db, fetch_assigned_tickets_from_db
from backend.models.user import get_tickets_by_userid, get_tickets_stats
from datetime import datetime, timezone

# Configure CORS for socket
socketio = SocketIO(cors_allowed_origins="*")

# Single flexible serialize_ticket function
def serialize_ticket(ticket):
    """Convert ticket dictionary to a JSON-serializable format, handling optional fields."""
    serialized = {
        "ticket_id": ticket["ticket_id"],
        "description": ticket["description"],
        "category": ticket["category"],
        "status": ticket["status"],
        "priority": ticket["priority"],
        "created_at": (ticket["created_at"].replace(tzinfo=timezone.utc).isoformat()
                       if isinstance(ticket["created_at"], datetime) else ticket["created_at"]),
        "last_updated": (ticket["last_updated"].replace(tzinfo=timezone.utc).isoformat()
                         if isinstance(ticket["last_updated"], datetime) else ticket["last_updated"]),
    }
    optional_fields = {
        "system_number": "system_number",
        "venue": "venue",
        "block": "block",
        "is_emergency": "is_emergency",
        "started_time": "started_time",
        "closure_time": "closure_time",
        "sla_deadline": "sla_deadline",
        "technician_id": "technician_id",
    }
    for serialized_key, ticket_key in optional_fields.items():
        if ticket_key in ticket:
            if isinstance(ticket[ticket_key], datetime):
                serialized[serialized_key] = ticket[ticket_key].replace(tzinfo=timezone.utc).isoformat()
            else:
                serialized[serialized_key] = ticket[ticket_key]
    return serialized


@socketio.on("connect")
def connect():
    print("Client connected")

@socketio.on("unread-notifications")
def update_unread_notifications(user_id):
    count = get_unread_notifications_count_by_userid(user_id)
    print(count)
    emit("unread-notifications", {"user_id": user_id, "count": count}, broadcast=True)

@socketio.on("ticket-assigned")
def emit_ticket_assigned(id):
    assigned = get_assigned_tickets_from_db()
    unassigned = get_unassigned_tickets_from_db()

    def convert_datetime(ticket, key):
        if isinstance(ticket.get(key), datetime):
            return ticket[key].replace(tzinfo=timezone.utc).isoformat()
        return ticket.get(key)

    for ticket in assigned:
        for key in ["created_at", "last_updated", "sla_deadline", "started_time", "closure_time"]:
            ticket[key] = convert_datetime(ticket, key)

    for ticket in unassigned:
        for key in ["created_at", "last_updated", "sla_deadline", "started_time", "closure_time"]:
            ticket[key] = convert_datetime(ticket, key)

    emit("ticket-assigned", {"assigned": assigned, "unassigned": unassigned}, broadcast=True)

@socketio.on("inprogress-update")
def emit_ticket_assigned(user_id):
    tickets = get_tickets_stats(user_id)
    serialized_tickets = [serialize_ticket(ticket) for ticket in tickets["active_tickets_list"]]
    print(tickets)
    emit("inprogress-update", {
        "user_id": user_id,
        "metrics": {
            "opened_today": tickets["opened_today"],
            "active_tickets": tickets["active_tickets"],
            "closed_tickets": tickets["closed_tickets"],
            "total_tickets": tickets["total_tickets"],
        },
        "tickets": serialized_tickets
    }, broadcast=True)

@socketio.on("technician-assigned-tickets")
def emit_technician_assigned_tickets(technician_id):
    tickets = fetch_assigned_tickets_from_db(technician_id)
    if tickets:
        serialized_tickets = [serialize_ticket(ticket) for ticket in tickets]
        emit("technician-assigned-tickets", {
            "technician_id": technician_id,
            "tickets": serialized_tickets
        }, broadcast=True)

@socketio.on("technician-work-history")
def emit_technician_work_history(technician_id):
    tickets = fetch_all_tickets_from_db(technician_id)
    if tickets:
        serialized_tickets = [serialize_ticket(ticket) for ticket in tickets]
        emit("technician-work-history", {
            "technician_id": technician_id,
            "tickets": serialized_tickets
        }, broadcast=True)

@socketio.on("user-ticket-history")
def emit_user_ticket_history(user_id):
    tickets = get_tickets_by_userid(user_id)
    if tickets:
        serialized_tickets = [serialize_ticket(ticket) for ticket in tickets]
        emit("user-ticket-history", {
            "user_id": user_id,
            "tickets": serialized_tickets
        }, broadcast=True)
        
