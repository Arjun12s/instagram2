import React, { useEffect, useState } from "react";
import '../css/message.css'; // Adjust the path according to your file structure

export default function Message() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    // Dummy data for initial display
    useEffect(() => {
        setMessages([
            { text: "Hi", sender: "me", timestamp: new Date() },
            { text: "Hello", sender: "other", timestamp: new Date() }
        ]);
    }, []);

    const sendMessage = () => {
        if (newMessage.trim() !== "") {
            // Assuming backend call to send message
            // sendMessageToBackend(newMessage);
            
            // Update local state
            const newMsg = { text: newMessage, sender: "me", timestamp: new Date() };
            setMessages([...messages, newMsg]);
            setNewMessage("");
        }
    };

    return (
        <div className="message-container">
            <div className="message-header">
                <h2>Chat</h2>
            </div>
            <div className="message-history">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <p>{msg.text}</p>
                        <span>{msg.timestamp.toLocaleString()}</span>
                    </div>
                ))}
            </div>
            <div className="message-input">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}
