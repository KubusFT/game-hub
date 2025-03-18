import React from 'react';

const GameItem = ({ game }) => {
  return (
    <div>
      <h3>{game.name}</h3>
      {game.cover && <img src={game.cover} alt={game.name} />}
      <p>Release Date: {game.release_date || 'N/A'}</p>
    </div>
  );
};

export default GameItem;