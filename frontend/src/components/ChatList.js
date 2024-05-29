import React from "react";

const ChatList = ({ chats }) => {
    return (
        <div className="chat-list">
            {chats.map(chat => (
                <div key={chat._id} className="chat-list-item">
                    {/* Render chat list item */}
                </div>
            ))}
        </div>
    );
};

export default ChatList;
