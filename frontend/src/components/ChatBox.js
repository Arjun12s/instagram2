import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatItems from "./ChatItem";
const ChatBox = () => {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const res = await axios.get("/fetchats");
            setChats(res.data);
        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    };

    return (
        <div className="chat-box">
            {chats.map(chat => (
                <ChatItems key={chat._id} chat={chat} />
            ))}
        </div>
    );
};

export default ChatBox;
