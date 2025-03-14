import React, { useEffect, useState } from 'react';
import GameItem from './GameItem';


const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Fetch Steam app list (game IDs)
        const response = await fetch('http://localhost:4000/api/games');

        if (!response.ok) {
          throw new Error('Failed to fetch game list from Steam');
        }

        const data = await response.json();

        // Now, you have the list of apps (game IDs)
        const gameList = data.applist.apps;

        // Example: Fetch additional info for the first 10 games
        const gameDetailsPromises = gameList.slice(0, 50).map(async (game) => {
          const gameDetailResponse = await fetch(`http://localhost:4000/api/game-details/${game.appid}`);
          const gameDetailData = await gameDetailResponse.json();
          
          // Return formatted data for each game
          return {
            id: game.appid,
            name: game.name,
            release_date: gameDetailData[game.appid]?.data?.release_date?.date,
            cover: gameDetailData[game.appid]?.data?.header_image,  // Cover image URL
            type: gameDetailData[game.appid]?.data?.type
          };
        });

        // Wait for all game details to be fetched
        const gameDetails = await Promise.all(gameDetailsPromises);

        setGames(gameDetails);
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