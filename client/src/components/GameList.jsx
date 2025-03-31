import React, { useEffect, useState } from 'react';
import GameCard from './GameCard';
import "./GameList.css";

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user") || "null"));

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        // Dodajemy userId do zapytania, jeśli użytkownik jest zalogowany
        const url = user 
          ? `http://localhost:4000/api/games?userId=${user.id}` 
          : 'http://localhost:4000/api/games';
          
        const res = await fetch(url);
        const data = await res.json();
        setGames(data);
      } catch (err) {
        console.error('Error fetching games:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGames();
  }, [user]);

  const sortGames = (sortMethod) => {
    setSortBy(sortMethod);
    let sortedGames = [...games];
    
    switch (sortMethod) {
      case 'rating':
        sortedGames.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case 'votes':
        sortedGames.sort((a, b) => b.rating_count - a.rating_count);
        break;
      case 'name':
      default:
        sortedGames.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setGames(sortedGames);
  };
  
  const handleVote = (gameId, newRating) => {
    if (!user) {
      alert('Musisz być zalogowany, aby ocenić grę');
      return;
    }
    
    fetch(`http://localhost:4000/api/games/${gameId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: newRating, userId: user.id })
    })
    .then(res => res.json())
    .then(updatedGame => {
      // Aktualizujemy stan gier, zamieniając zaktualizowaną grę
      setGames(prevGames => 
        prevGames.map(game => 
          game.id === updatedGame.id ? updatedGame : game
        )
      );
    })
    .catch(err => console.error('Error voting for game:', err));
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center text-[#0077ff] mb-8">Lista Gier</h1>
      
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => sortGames('name')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              sortBy === 'name' 
                ? 'bg-[#0077ff] text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Alfabetycznie
          </button>
          <button
            onClick={() => sortGames('rating')}
            className={`px-4 py-2 text-sm font-medium ${
              sortBy === 'rating' 
                ? 'bg-[#0077ff] text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Wg Ocen
          </button>
          <button
            onClick={() => sortGames('votes')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              sortBy === 'votes' 
                ? 'bg-[#0077ff] text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Wg Popularności
          </button>
        </div>
      </div>
      
      {loading ? (
        <p className="text-center">Ładowanie gier...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              onVote={handleVote}
              isLoggedIn={!!user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GameList;