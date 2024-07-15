import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/message.css';
import Search from './Search';
import { io } from 'socket.io-client';

const ENDPOINT = `http://localhost:3000`;
let socket;

const Message = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [currentConversationId, setCurrentConversationId] = useState(conversationId || null);
    const [user, setUser] = useState({});
    const [conversations, setConversations] = useState([]);
    const [receiver, setReceiver] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');

    const piclink = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhcdVEzoVWLyCqD6wPIyxnxW3L2lYNzsmrGHK-A-tGxA&s';

    const getToken = () => {
        return localStorage.getItem("jwt");
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.on('receive_message', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchConversations = async () => {
            const token = getToken();
            if (!token) {
                console.error('No token found');
                return;
            }

            try {
                const user = JSON.parse(localStorage.getItem("user"));
                const res = await fetch(`/conversation/${user._id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                });
                if (!res.ok) {
                    throw new Error('Error fetching conversations');
                }
                const resData = await res.json();
                setConversations(Array.isArray(resData) ? resData : []);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };

        fetchConversations();
    }, []);

    useEffect(() => {
        if (currentConversationId) {
            fetchMessages(currentConversationId);
            socket.emit('join_conversation', currentConversationId);
        }
    }, [currentConversationId]);

    const fetchMessages = async (conversationId) => {
        const token = getToken();
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            const res = await fetch(`/message/${conversationId}`, {
                method: "GET",
                headers: {
                    'Content-type': "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error('Error fetching messages');
            }
            const resData = await res.json();
            setMessages(resData);
            const conversation = conversations.find(conv => conv.conversationId === conversationId);
            setReceiver(conversation?.user || null);
            setCurrentConversationId(conversationId);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchUserData = () => {
        const token = getToken();
        if (!token) {
            console.error('No token found');
            return;
        }

        fetch(`/user/${JSON.parse(localStorage.getItem("user"))._id}`, {
            headers: {
                'Content-type': "application/json",
                Authorization: `Bearer ${token}`,
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
        const token = getToken();
        if (!currentMessage || !currentConversationId || !senderId) {
            console.error('All fields are required');
            return;
        }

        if (!token) {
            console.error('No token found');
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
                    Authorization: `Bearer ${token}`,
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

            socket.emit('send_message', resData.newMessage);

            setCurrentMessage("");
            setStatusMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            setStatusMessage('Failed to send message');
        }
    };

    const handleConversationClick = (conversationId, user) => {
        setReceiver(user);
        setCurrentConversationId(conversationId);
        navigate(`/Message/${conversationId}`);
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
                    <div className='otherusersprofile'>
                        {conversations.map(({ conversationId, user }, index) => (
                            <div key={index} className='OtherUserProfile'>
                                <div className='profile-pic' onClick={() => handleConversationClick(conversationId, user)}>
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
                        <div className='profile-pic'><img src={receiver?.Photo || piclink} alt="receiver" /></div>
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
                            placeholder="Type a message"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                        />
                    </div>
                    <div className="sendMessage">
                        <span className="material-symbols-outlined" onClick={sendMessage}>send</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;
