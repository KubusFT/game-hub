import React from 'react';

const GameItem = ({ game }) => {
  return (
    <div className="game-item">
      <h3>{game.name}</h3>
      <p>Release Date: {game.release_date}</p>
      {game.cover && (
        <img src={`https://images.igdb.com/igdb/image/upload/t_cover_small_2x/${game.cover.image_id}.jpg`} alt={game.name} />
      )}
    </div>
  );
};

export default GameItem;