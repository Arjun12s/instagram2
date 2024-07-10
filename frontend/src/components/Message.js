import React, { useEffect, useState } from 'react';
import '../css/message.css';
import Search from './Search';

const Message = () => {
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [user, setUser] = useState({});
    const [conversations, setConversations] = useState([]);
    const [receiver, setReceiver] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');

    const piclink = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhcdVEzoVWLyCqD6wPIyxnxW3L2lYNzsmrGHK-A-tGxA&s';

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                const res = await fetch(`/conversation/${user._id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + localStorage.getItem("jwt")
                    },
                });
                const resData = await res.json();
                setConversations(Array.isArray(resData) ? resData : []);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };

        fetchConversations();
    }, []);

    const fetchMessages = async (conversationId, user) => {
        try {
            const res = await fetch(`/message/${conversationId}`, {
                method: "GET",
                headers: {
                    'Content-type': "application/json",
                    Authorization: "Bearer " + localStorage.getItem("jwt"),
                },
            });
            const resData = await res.json();
            setMessages(resData);
            setReceiver(user);
            setCurrentConversationId(conversationId);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchUserData = () => {
        fetch(`/user/${JSON.parse(localStorage.getItem("user"))._id}`, {
            headers: {
                'Content-type': "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
        })
            .then((res) => res.json())
            .then((result) => {
                setUser(result.user);
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const sendMessage = async () => {
        const senderId = JSON.parse(localStorage.getItem("user"))._id;
        if (!currentMessage || !currentConversationId || !senderId) {
            console.error('All fields are required');
            return;
        }

        const payload = {
            conversationId: currentConversationId,
            senderId: senderId,
            message: currentMessage,
        };

        console.log("Sending message with payload:", payload);

        try {
            const res = await fetch(`/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("jwt"),
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Error sending message:', errorText);
                setStatusMessage('Failed to send message');
                return;
            }

            const resData = await res.json();
            console.log("Message sent successfully:", resData.newMessage);

            setMessages((prevMessages) => [...prevMessages, resData.newMessage]);
            setCurrentMessage("");
            setStatusMessage('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
            setStatusMessage('Failed to send message');
        }
    };

    return (
        <div className='OuterRange'>
            <div className='layer1'>
                <div className='UserProfile'>
                    <div className='profile-pic'>
                        <img src={user.Photo ? user.Photo : piclink} alt="" />
                    </div>
                    <h3 className="NAME">{JSON.parse(localStorage.getItem("user")).name}</h3>
                    <p className="MY_ACCOUNT">{JSON.parse(localStorage.getItem("user")).userName}</p>
                </div>
                <hr />
                <div>
                    <div className="search"><Search /></div>
                    <div className="Messages" style={{ display: "flex", marginLeft: "10px" }}>MESSAGES</div>
                    <div>
                        {conversations.map(({ conversationId, user }, index) => (
                            <div key={index} className='OtherUserProfile'onClick={() => fetchMessages(conversationId, user)}>
                                <div className='profile-pic' >
                                    <img src={user ? user.Photo : piclink} alt="profile" />
                                </div>
                                <h3 className="NAME">{user ? user.name : "Unknown"}</h3>
                                <p className="MY_ACCOUNT">ACCOUNT_Status</p>
                                <hr />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className='layer2'>
                {receiver?.name && (
                    <div className="UserMESSAGE">
                        <div className='profile-pic'><img src={receiver?.Photo || piclink} alt="receiver" />
                        <div className='symbols'>
                        <span class="material-symbols-outlined">
                                call
                            </span>
                            <span class="material-symbols-outlined">
                                videocam
                            </span>
                            <span class="material-symbols-outlined">
                                more_vert
                            </span>
                        </div>
                        </div>
                        <h3 className="NAME" style={{ color: "red" }}>{receiver?.name}</h3>
                        <p className="ACCOUNT_Status">ACTIVE</p>
                        
                            
                        
                    </div>

                )}
                <div className='msgbox'>
                    <div className='insidemsgbox'>
                        {messages.length > 0 ? (
                            messages.map(({ message, senderId }, index) => (
                                <div key={index} className={`${senderId === user._id ? 'outmsg' : 'inmsg'}`}>
                                    {message}
                                </div>
                            ))
                        ) : (
                            <div style={{ background: "red", fontSize: "14px" }}>No messages</div>
                        )}
                    </div>
                </div>

                {statusMessage && <div className="status-message">{statusMessage}</div>}

                <div className="typing-Area">
                    <div className="selectfiles">
                        <span className="material-symbols-outlined">add_circle</span>
                    </div>
                    <div className='textInput'>
                        <input
                            type="text"
                            placeholder='Type a message'
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                        />
                    </div>
                    <div className='SendBtn'>
                        <span className="material-symbols-outlined" onClick={sendMessage}>send</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;
