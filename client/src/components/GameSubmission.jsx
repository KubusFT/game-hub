import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GameSubmission = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setMessage('Musisz być zalogowany, aby dodać grę');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:4000/api/games/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    releaseDate,
                    userId: user.id
                })
            });

            const data = await res.json();
            
            if (res.ok) {
                setMessage(data.message);
                setName('');
                setDescription('');
                setReleaseDate('');
                // Po 2 sekundach przekieruj na stronę główną
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setMessage(data.error);
            }
        } catch (err) {
            console.error('Error submitting game:', err);
            setMessage('Wystąpił błąd podczas dodawania gry.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="max-w-md mx-auto my-8 p-6 bg-white bg-opacity-80 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Dodaj nową grę</h2>
                <p className="text-red-500 text-center">Musisz być zalogowany, aby dodać grę.</p>
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Przejdź do logowania
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto my-8 p-6 bg-white bg-opacity-80 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Dodaj nową grę</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Nazwa gry:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Opis gry:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="4"
                    ></textarea>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Data wydania:</label>
                    <input
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="flex items-center justify-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Trwa dodawanie...' : 'Dodaj grę'}
                    </button>
                </div>
            </form>
            {message && (
                <div className={`mt-4 p-2 ${message.includes('zatwierdz') || message.includes('zgłoszona') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default GameSubmission;