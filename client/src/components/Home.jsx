import React, { useEffect, useState } from 'react';

const Home = () => {
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
    <div className="game-list">
      <h1>Game List</h1>
      <ul>
        {games.map(game => (
          <li key={game.id} className="game-item">
            <h2>{game.name}</h2>
            <p>Release Date: {new Date(game.release_date * 1000).toLocaleDateString()}</p>
            {game.cover && <img src={game.cover} alt={game.name} />}
            <button className="star-button">⭐</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;