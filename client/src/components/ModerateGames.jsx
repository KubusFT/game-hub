import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ModerateGames = () => {
    const [pendingGames, setPendingGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user') || 'null'));

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchPendingGames();
    }, [user, navigate]);

    const fetchPendingGames = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/games/pending?userId=${user.id}`);
            
            if (res.status === 403) {
                setError('Brak uprawnień do dostępu do tej strony');
                navigate('/');
                return;
            }
            
            if (!res.ok) {
                throw new Error('Błąd podczas pobierania oczekujących gier');
            }
            
            const data = await res.json();
            console.log('Pending games data:', data); // Sprawdzenie danych
            setPendingGames(data);
        } catch (err) {
            console.error('Error fetching pending games:', err);
            setError('Wystąpił błąd podczas pobierania oczekujących gier');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (gameId) => {
        try {
            const res = await fetch(`http://localhost:4000/api/games/approve/${gameId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setMessage('Gra została zatwierdzona');
                // Odśwież listę oczekujących gier
                setPendingGames(pendingGames.filter(game => game.id !== gameId));
            } else {
                setMessage(data.error);
            }
        } catch (err) {
            console.error('Error approving game:', err);
            setMessage('Wystąpił błąd podczas zatwierdzania gry');
        }
    };

    const handleReject = async (gameId) => {
        try {
            const res = await fetch(`http://localhost:4000/api/games/reject/${gameId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setMessage('Gra została odrzucona');
                // Odśwież listę oczekujących gier
                setPendingGames(pendingGames.filter(game => game.id !== gameId));
            } else {
                setMessage(data.error);
            }
        } catch (err) {
            console.error('Error rejecting game:', err);
            setMessage('Wystąpił błąd podczas odrzucania gry');
        }
    };

    if (loading) return <div className="text-center py-12">Ładowanie...</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto my-8 p-6 bg-white bg-opacity-80 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Panel moderacji gier</h2>
            
            {message && (
                <div className={`mb-4 p-2 ${message.includes('zatwierdz') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded`}>
                    {message}
                </div>
            )}
            
            {pendingGames.length === 0 ? (
                <p className="text-center py-4">Brak oczekujących gier do moderacji</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white text-gray-800">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Nazwa</th>
                                <th className="py-2 px-4 border-b">Opis</th>
                                <th className="py-2 px-4 border-b">Data wydania</th>
                                <th className="py-2 px-4 border-b">Zgłoszona przez</th>
                                <th className="py-2 px-4 border-b">Data zgłoszenia</th>
                                <th className="py-2 px-4 border-b">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
    {pendingGames && pendingGames.length > 0 ? (
        pendingGames.map(game => (
            <tr key={game.id}>
                <td className="py-2 px-4 border-b">{game?.name || 'Brak nazwy'}</td>
                <td className="py-2 px-4 border-b">{game?.description || 'Brak opisu'}</td>
                <td className="py-2 px-4 border-b">
                    {game?.release_date ? new Date(game.release_date).toLocaleDateString() : 'Brak daty'}
                </td>
                <td className="py-2 px-4 border-b">{game?.submitted_by_username || 'Nieznany'}</td>
                <td className="py-2 px-4 border-b">
                    {game?.submission_date ? new Date(game.submission_date).toLocaleString() : 'Brak daty'}
                </td>
                <td className="py-2 px-4 border-b">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleApprove(game.id)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm"
                        >
                            Zatwierdź
                        </button>
                        <button
                            onClick={() => handleReject(game.id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm"
                        >
                            Odrzuć
                        </button>
                    </div>
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="6" className="py-4 text-center">
                Brak oczekujących gier do moderacji
            </td>
        </tr>
    )}
</tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ModerateGames;