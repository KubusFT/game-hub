import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import './shoutbox.css';

const Shoutbox = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        // Funkcja do ładowania wiadomości
        const loadMessages = () => {
            fetch("http://localhost:4000/api/shoutbox/messages")
                .then((res) => res.json())
                .then((data) => setMessages(data))
                .catch((err) => console.error(err));
        };
    
        loadMessages();

        const intervalId = setInterval(loadMessages, 5000); 

        return () => clearInterval(intervalId);
    }, []);

    const sendMessage = () => {

        if (!newMessage.trim()) {
            alert("Wiadomość nie może być pusta.");
            return;
        }
        // Send the new message to the server
        fetch("http://localhost:4000/api/shoutbox/send", {
            method: "POST",
            body: JSON.stringify({
                message: newMessage,
                userId: localStorage.getItem("_id"),
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                alert(data.message);
                setNewMessage("");
                // Fetch the updated list of messages
                fetch("http://localhost:4000/api/shoutbox/messages")
                    .then((res) => res.json())
                    .then((data) => setMessages(data))
                    .catch((err) => console.error(err));
            })
            .catch((err) => console.error(err));
    };

    return (
        <div className="shoutbox">
            <h2>Shoutbox</h2>
            <div className="shoutbox__messages" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {messages && [...messages].reverse().map((message, index) => (
    <div key={index} className="message">
        <Link to={`/user/${message.userId}`} className="userId username-link">{message.username}: </Link>
        <span className="messageText">{message.message}</span>
    </div>
))}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
                className="shoutbox-input"
            />
            <button className="shoutbox-button"onClick={sendMessage}>Wyślij</button>
        </div>
    );
};

export default Shoutbox;