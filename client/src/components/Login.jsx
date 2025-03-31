import React, { useState } from 'react';
import './Auth.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                // Zapisz dane użytkownika w sessionStorage
                sessionStorage.setItem("user", JSON.stringify(data.user));
                setMessage(`Witaj, ${data.user.username}`);
            } else {
                setMessage(data.error);
            }
        } catch (err) {
            console.error('Login error:', err);
            setMessage('Błąd podczas logowania.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Logowanie</h2>
            <form className='text-black' onSubmit={handleSubmit}>
                <div>
                    <label>Nazwa użytkownika: </label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>Hasło: </label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Zaloguj się</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;