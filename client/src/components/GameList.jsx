import React, { useEffect, useState } from 'react';
import GameItem from './GameItem';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/games');

        if (!response.ok) {
          throw new Error('Failed to fetch game list from Steam');
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

    const eventSource = new EventSource('http://localhost:4000/api/progress');
    eventSource.onmessage = (event) => {
      setProgress(event.data);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) return <div>Loading... {progress}%</div>;
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