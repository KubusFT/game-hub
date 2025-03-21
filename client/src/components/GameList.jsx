import React, { useEffect, useState } from 'react';
import GameItem from './GameItem';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/games');

        if (!response.ok) {
          throw new Error('Failed to fetch game list from the database');
        }

        const data = await response.json();
        setGames(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-wrap justify-center gap-6 p-6">
      {games.map(game => (
        <GameItem key={game.id} game={game} />
      ))}
    </div>
  );
};

export default GameList;