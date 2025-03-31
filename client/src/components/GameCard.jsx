import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const GameCard = ({ game, onVote, isLoggedIn }) => {
  const renderStars = (rating, interactive = false) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      
      if (interactive) {
        return (
          <span
            key={starValue}
            onClick={() => onVote(game.id, starValue)}
            className="cursor-pointer"
          >
            {starValue <= (game.user_rating || 0) ? (
              <FaStar className="text-yellow-400 text-xl inline-block" />
            ) : (
              <FaRegStar className="text-gray-400 text-xl inline-block hover:text-yellow-400" />
            )}
          </span>
        );
      } else {
        return (
          <span key={starValue}>
            {starValue <= Math.round(rating) ? (
              <FaStar className="text-yellow-400 text-xl inline-block" />
            ) : (
              <FaRegStar className="text-gray-400 text-xl inline-block" />
            )}
          </span>
        );
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transform transition-transform hover:-translate-y-1 hover:shadow-lg">
      <h2 className="text-xl font-bold mb-3 text-[#0077ff] truncate">{game.name}</h2>
      
      <div className="mb-4">
        <p className="text-gray-600 mb-1">Średnia ocena:</p>
        <div className="flex items-center gap-2">
          {renderStars(game.average_rating)}
          <span className="text-gray-700">
            ({Number(game.average_rating) ? Number(game.average_rating).toFixed(1) : "0"}/5 z {game.rating_count || 0} głosów)
          </span>
        </div>
      </div>
      
      {isLoggedIn && (
        <div className="mt-4 border-t pt-3">
          <p className="text-gray-600 mb-1">Twoja ocena:</p>
          <div className="flex items-center gap-1">
            {renderStars(game.user_rating || 0, true)}
          </div>
        </div>
      )}
      
      {!isLoggedIn && (
        <p className="text-sm text-gray-500 mt-3">
          Zaloguj się, aby ocenić tę grę
        </p>
      )}
    </div>
  );
};

export default GameCard;