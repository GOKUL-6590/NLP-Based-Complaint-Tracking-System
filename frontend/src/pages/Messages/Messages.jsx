import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./Messages.css";
import socket from "../../components/socket";
import { fetchMappedTechnicians, fetchMappedUsers, fetchMessages, markMessagesAsRead, fetchUnreadCounts } from "../../service/messageService";
import { FaTrash, FaTimes, FaPaperPlane, FaArrowDown } from "react-icons/fa";
import ScrollToBottom from "react-scroll-to-bottom";

const Messages = () => {
    const { user } = useSelector((state) => state.user);
    const persistedUser = JSON.parse(localStorage.getItem("user")) || user;
    const role = persistedUser?.role;
    const isTechnician = role === "technician";

    if (!persistedUser?.id) {
        console.error("User ID not found");
        return <div>Please log in to view messages</div>;
    }

    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showScrollDown, setShowScrollDown] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        const fetchContactsAndCounts = async () => {
            try {
                const response = isTechnician
                    ? await fetchMappedUsers(persistedUser.id)
                    : await fetchMappedTechnicians(persistedUser.id);
                if (response.success) {
                    const contactsWithAvatar = response.contacts.map((contact) => ({
                        ...contact,
                        avatar: `https://ui-avatars.com/api/?name=${contact.name}&background=random`,
                    }));
                    setContacts(contactsWithAvatar);
                }

                const unreadResponse = await fetchUnreadCounts(persistedUser.id);
                if (unreadResponse.success) {
                    setUnreadCounts(unreadResponse.unread_counts || {});
                }
            } catch (error) {
                console.error("Failed to fetch contacts or unread counts:", error);
            }
        };
        fetchContactsAndCounts();

        socket.emit("join", persistedUser.id);
        socket.on("new-message", (message) => {
            console.log("New message received:", message); // Debug log

            // Add message to current chat if it involves the selected contact
            const isForCurrentChat =
                (message.sender_id === persistedUser.id || message.receiver_id === persistedUser.id) &&
                (message.sender_id === selectedContact?.id || message.receiver_id === selectedContact?.id);
            if (isForCurrentChat) {
                setMessages((prev) => [...prev, message]);
            }


            // Update unread count if the message is for this user and unread
            if (message.receiver_id === persistedUser.id && message.is_read === 0) {
                const contactId = message.sender_id;
                setUnreadCounts((prev) => {
                    const newCounts = { ...prev };
                    newCounts[contactId] = (newCounts[contactId] || 0) + 1;
                    console.log("Updated unread counts:", newCounts); // Debug log
                    return newCounts;
                });
            }
        });

        socket.on("chat-cleared", ({ user_id, contact_id }) => {
            if (user_id === persistedUser.id && contact_id === selectedContact?.id) {
                setMessages([]);
            }
        });

        return () => {
            socket.off("new-message");
            socket.off("chat-cleared");
        };
    }, [persistedUser.id, isTechnician, selectedContact]);

    useEffect(() => {
        if (!selectedContact) return;
        const fetchChatHistory = async () => {
            try {
                const response = await fetchMessages(persistedUser.id, selectedContact.id, isTechnician);
                if (response.success) {
                    setMessages(
                        response.messages.filter(
                            (msg) =>
                                (msg.sender_id === persistedUser.id && !msg.is_deleted_for_sender) ||
                                (msg.receiver_id === persistedUser.id && !msg.is_deleted_for_receiver)
                        )
                    );
                    await markMessagesAsRead(persistedUser.id, selectedContact.id);
                    const unreadResponse = await fetchUnreadCounts(persistedUser.id);
                    if (unreadResponse.success) {
                        setUnreadCounts(unreadResponse.unread_counts || {});
                    }
                }
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        };
        fetchChatHistory();
    }, [selectedContact, persistedUser.id, isTechnician]);

    const sendMessage = () => {
        if (!newMessage.trim() || !selectedContact) return;
        const message = {
            sender_id: persistedUser.id,
            receiver_id: selectedContact.id,
            text: newMessage,
            ticket_id: null,
        };
        socket.emit("send-message", message);
        setNewMessage("");
    };

    const deleteMessage = (index) => {
        setMessages((prev) => prev.filter((_, i) => i !== index));
    };

    const closeChat = () => {
        setSelectedContact(null);
        setMessages([]);
    };

    const clearChat = () => {
        if (!selectedContact) return;
        const clearData = {
            sender_id: persistedUser.id,
            receiver_id: selectedContact.id,
        };
        socket.emit("clear-chat", clearData);
        setMessages([]);
    };

    const scrollToBottom = () => {
        document.querySelector(".chat-messages")?.scrollTo({
            top: Number.MAX_SAFE_INTEGER,
            behavior: "smooth",
        });
    };

    const handleScroll = ({ scrollTop, scrollHeight, clientHeight }) => {
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        setShowScrollDown(!isAtBottom);
    };

    return (
        <div className="messages-container">
            <div className="contacts-list">
                <h2 className="contacts-header">{isTechnician ? "Users" : "Technicians"}</h2>
                {contacts.map((contact) => (
                    <div
                        key={contact.id}
                        className={`contact-item ${selectedContact?.id === contact.id ? "selected" : ""}`}
                        onClick={() => setSelectedContact(contact)}
                    >
                        <img src={contact.avatar} alt={contact.name} className="contact-avatar" />
                        <div className="contact-info">
                            <span>{contact.name}</span>
                            {unreadCounts[contact.id] > 0 && (
                                <span className="unread-count">{unreadCounts[contact.id]}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="chat-area">
                {selectedContact ? (
                    <>
                        <div className="chat-header">
                            <img src={selectedContact.avatar} alt={selectedContact.name} className="chat-avatar" />
                            <h3>{selectedContact.name}</h3>
                            <button className="clear-chat-btn" onClick={clearChat} title="Clear Chat">
                                <FaTrash />
                            </button>
                            <button className="close-chat-btn" onClick={closeChat} title="Close Chat">
                                <FaTimes />
                            </button>
                        </div>
                        <ScrollToBottom
                            className="chat-messages"
                            onScroll={handleScroll}
                            followButtonClassName="scroll-down-btn"
                        >
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`message ${msg.sender_id === persistedUser.id ? "sent" : "received"}`}
                                >
                                    <div className="message-content">
                                        <p>{msg.text}</p>
                                        <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                                        {msg.sender_id === persistedUser.id && (
                                            <button className="delete-btn" onClick={() => deleteMessage(idx)}>
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {showScrollDown && (
                                <button className="scroll-down-btn" onClick={scrollToBottom} title="Scroll to bottom">
                                    <FaArrowDown />
                                </button>
                            )}
                        </ScrollToBottom>
                        <div className="chat-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Type a message..."
                            />
                            <button className="send-btn" onClick={sendMessage}>
                                <FaPaperPlane />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Select a contact to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;