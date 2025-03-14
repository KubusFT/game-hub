import React from 'react';

const GameItem = ({ game }) => {
  return (
    <div className="card game-item card-body bg-light mb-3 text-center p-4 shadow rounded border border-secondary mx-auto">
      <h3>{game.name}</h3>
      <p>Release Date: {game.release_date}</p>
      {game.cover && (
        // Steam API provides header_image as the cover image URL
        <img src={game.cover} alt={game.name} />
      )}
    </div>
  );
};

export default GameItem;
