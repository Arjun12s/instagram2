// ChatItem.js
import React from "react";
import '../css/Chats.css';

const ChatItem = ({ chat, onSelectChat }) => {
    return (
        <div className="chat-item" onClick={() => onSelectChat(chat)}>
            <h3>{chat.chatName}</h3>
            <p>Latest message: {chat.latestMessage?.content || "No messages yet"}</p>
        </div>
    );
};

export default ChatItem;
