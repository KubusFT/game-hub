import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const Profile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [message, setMessage] = useState('');
    const [loggedInUser, setLoggedInUser] = useState(JSON.parse(sessionStorage.getItem('user') || 'null'));
    const navigate = useNavigate();
    
    // Funkcja formatująca datę
    const formatDate = (dateString) => {
        if (!dateString) return 'Brak danych';
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // Debugging
    useEffect(() => {
        console.log("Profile component mounted, id:", id);
        console.log("Logged in user:", loggedInUser);
    }, []);
    
    // Pobieranie danych profilu
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                console.log("Fetching profile data for id:", id);
                const res = await fetch(`http://localhost:4000/api/users/${id}/profile`);
                
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error('Użytkownik nie istnieje');
                    }
                    throw new Error('Błąd podczas pobierania danych profilu');
                }
                
                const data = await res.json();
                console.log("Profile data received:", data);
                setProfile(data);
                setBio(data.bio || '');
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            fetchProfile();
        } else {
            setError("Brak ID użytkownika");
            setLoading(false);
        }
    }, [id]);
    
    // Obsługa aktualizacji profilu
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        
        if (!loggedInUser || loggedInUser.id !== parseInt(id)) {
            setMessage('Nie masz uprawnień do edycji tego profilu');
            return;
        }
        
        try {
            const res = await fetch(`http://localhost:4000/api/users/${id}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bio,
                    requesterId: loggedInUser.id
                })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setMessage('Profil został zaktualizowany');
                setEditing(false);
                // Odśwież dane profilu
                setProfile({
                    ...profile,
                    bio
                });
            } else {
                setMessage(data.error);
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setMessage('Wystąpił błąd podczas aktualizacji profilu');
        }
    };
    
    // Renderowanie gwiazdek dla oceny
    const renderStars = (rating) => {
        return Array(5).fill(0).map((_, i) => (
            <span key={i} className={`text-xl ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
        ));
    };
    
    if (loading) return <div className="text-center py-12 text-white">Ładowanie...</div>;
    if (error) return <div className="text-center py-12 text-red-500 bg-white bg-opacity-80 p-4 rounded">{error}</div>;
    if (!profile) return <div className="text-center py-12 text-white bg-opacity-80 p-4 rounded">Nie znaleziono danych profilu</div>;
    
    return (
        <div className="max-w-4xl mx-auto my-8 p-6 bg-white bg-opacity-80 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Profil użytkownika</h2>
            
            {message && (
                <div className={`mb-4 p-2 ${message.includes('zaktualizowany') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded`}>
                    {message}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lewa kolumna - informacje o użytkowniku */}
                <div className="md:col-span-1">
                    <div className="bg-gray-50 p-4 rounded-lg shadow">
                        <div className="text-center mb-4">
                            <div className="w-24 h-24 bg-blue-500 text-white text-4xl flex items-center justify-center rounded-full mx-auto">
                                {profile.username ? profile.username.charAt(0).toUpperCase() : '?'}
                            </div>
                            <h3 className="text-xl font-semibold mt-2 text-black">{profile.username || 'Użytkownik'}</h3>
                            <p className="text-gray-500 text-sm">
                                {profile.role === 'admin' ? 'Administrator' : 
                                 profile.role === 'moderator' ? 'Moderator' : 'Użytkownik'}
                            </p>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-3 text-black">
                            <p className="text-sm text-gray-600">Data dołączenia:</p>
                            <p className="font-medium">{formatDate(profile.created_at)}</p>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-3 mt-3 text-black">
                            <p className="text-sm text-gray-600">Statystyki:</p>
                            <ul className="mt-1">
                                <li className="flex justify-between">
                                    <span>Ocenione gry:</span>
                                    <span className="font-medium">{profile.stats?.ratedGamesCount || 0}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Dodane gry:</span>
                                    <span className="font-medium">{profile.stats?.submittedGamesCount || 0}</span>
                                </li>
                            </ul>
                        </div>
                        
                        {loggedInUser && loggedInUser.id === parseInt(id) && (
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => setEditing(!editing)}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    {editing ? 'Anuluj edycję' : 'Edytuj profil'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Prawa kolumna - bio lub formularz edycji + ocenione gry */}
                <div className="md:col-span-2">
                    {editing ? (
                        <form onSubmit={handleUpdateProfile} className="bg-gray-50 p-4 rounded-lg shadow mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-black">Edytuj swój profil</h3>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">O mnie:</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    rows="4"
                                    placeholder="Napisz coś o sobie..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Zapisz zmiany
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-black">O mnie</h3>
                            <p className="text-gray-700">{profile.bio || 'Ten użytkownik nie dodał jeszcze opisu.'}</p>
                        </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg shadow text-black">
                        <h3 className="text-lg font-semibold mb-3">Ostatnio ocenione gry</h3>
                        
                        {profile.ratedGames && profile.ratedGames.length > 0 ? (
                            <div className="space-y-4">
                                {profile.ratedGames.map(game => (
                                    <div key={game.id} className="border-b border-gray-200 pb-3">
                                        <div className="flex justify-between items-center">
                                            <Link to={`/games/${game.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                                                {game.name}
                                            </Link>
                                            <div className="flex items-center">
                                                {renderStars(game.rating)}
                                                <span className="ml-2 text-sm text-gray-500">({game.rating}/5)</span>
                                            </div>
                                        </div>
<p className="text-sm text-gray-500 mt-1">
    Średnia ocena: {game.average_rating ? parseFloat(game.average_rating).toFixed(1) : "0"}/5
</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Ten użytkownik nie ocenił jeszcze żadnych gier.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;