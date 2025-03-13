import React, { useState } from 'react';

const games = [
  { id: 1, name: 'Fortnite', rating: 0 },
  { id: 2, name: 'Valorant', rating: 0 },
  { id: 3, name: 'League of Legends', rating: 0 },
  { id: 4, name: 'Warframe', rating: 0 },
  { id: 5, name: 'Her new memory', rating: 0 },
  { id: 6, name: 'Genshin Impact', rating: 0 },
  { id: 7, name: 'Honkai Star Rail', rating: 0 },
  { id: 8, name: 'Minecraft', rating: 0 },
  { id: 9, name: 'Counter-Strike 2', rating: 0 },
  { id: 8, name: 'Wiedźmin 3', rating: 0 },
  { id: 9, name: 'Cyberpunk 2077', rating: 0 },
];

const GameList = () => {
  const [gameRatings, setGameRatings] = useState(games);

  const handleRating = (id, rating) => {
    setGameRatings((prevRatings) =>
      prevRatings.map((game) =>
        game.id === id ? { ...game, rating } : game
      )
    );
  };

  return (
    <div>
      <h1>Game List</h1>
      <ul>
        {gameRatings.map((game) => (
          <li key={game.id}>
            {game.name}
            <div>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => handleRating(game.id, star)}
                  style={{ cursor: 'pointer', color: game.rating >= star ? 'gold' : 'gray' }}
                >
                  ★
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameList;