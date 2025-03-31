import React, { useState } from 'react';
import './Auth.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Rejestracja powiodła się!');
            } else {
                setMessage(data.error);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setMessage('Błąd podczas rejestracji.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Rejestracja</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nazwa użytkownika: </label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>Hasło: </label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Zarejestruj się</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Register;