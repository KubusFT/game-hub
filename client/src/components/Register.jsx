import React, { useState } from 'react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const validatePassword = (password) => {
        const errors = {};
        
        if (password.length < 8) {
            errors.length = 'Hasło musi mieć co najmniej 8 znaków';
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.uppercase = 'Hasło musi zawierać co najmniej jedną dużą literę';
        }
        
        if (!/[0-9]/.test(password)) {
            errors.number = 'Hasło musi zawierać co najmniej jedną cyfrę';
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.special = 'Hasło musi zawierać co najmniej jeden znak specjalny';
        }
        
        return errors;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setErrors({});
        
        // Sprawdzenie zgodności haseł
        if (password !== confirmPassword) {
            setErrors({ confirmPassword: 'Hasła nie są zgodne' });
            return;
        }
        
        // Walidacja hasła
        const passwordErrors = validatePassword(password);
        if (Object.keys(passwordErrors).length > 0) {
            setErrors(passwordErrors);
            return;
        }
        
        try {
            const res = await fetch('http://localhost:4000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Rejestracja powiodła się!');
                setUsername('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setMessage(data.error);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setMessage('Błąd podczas rejestracji.');
        }
    };

    return (
        <div className="max-w-md mx-auto my-8 p-6 bg-white bg-opacity-80 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Rejestracja</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Nazwa użytkownika: </label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        required 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Hasło: </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Potwierdź hasło: </label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        required 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {errors.confirmPassword && 
                        <p className="text-red-500 text-xs italic mt-1">{errors.confirmPassword}</p>
                    }
                </div>
                
                {Object.keys(errors).length > 0 && (
                    <div className="mb-6 p-3 bg-gray-100 rounded">
                        <p className="text-red-500 font-bold text-sm mb-2">Hasło musi spełniać następujące wymagania:</p>
                        <ul className="pl-5 text-sm">
                            <li className={errors.length ? 'text-red-500' : 'text-green-500'}>
                                Co najmniej 8 znaków
                            </li>
                            <li className={errors.uppercase ? 'text-red-500' : 'text-green-500'}>
                                Co najmniej jedna duża litera
                            </li>
                            <li className={errors.number ? 'text-red-500' : 'text-green-500'}>
                                Co najmniej jedna cyfra
                            </li>
                            <li className={errors.special ? 'text-red-500' : 'text-green-500'}>
                                Co najmniej jeden znak specjalny
                            </li>
                        </ul>
                    </div>
                )}
                
                <div className="flex items-center justify-center">
                    <button 
                        type="submit" 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Zarejestruj się
                    </button>
                </div>
            </form>
            {message && 
                <div className={`mt-4 p-2 ${message.includes('powiodła') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded`}>
                    {message}
                </div>
            }
        </div>
    );
};

export default Register;