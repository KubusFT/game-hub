import React, { useEffect, useState } from 'react';
import GameItem from './GameItem';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('https://api.igdb.com/v4/games', {
          method: 'POST',
          headers: {
            'Client-ID': process.env.REACT_APP_IGDB_CLIENT_ID,
            'Authorization': `Bearer ${process.env.REACT_APP_IGDB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: 'id,name,release_dates,cover',
            limit: 10,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch games');
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
    <div>
      {games.map(game => (
        <GameItem key={game.id} game={game} />
      ))}
    </div>
  );
};

export default GameList;