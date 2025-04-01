import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!searchQuery) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    fetch(`http://localhost:4000/api/games/search?q=${encodeURIComponent(searchQuery)}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Błąd podczas wyszukiwania');
        }
        return res.json();
      })
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error searching games:', err);
        setError('Wystąpił błąd podczas wyszukiwania gier');
        setLoading(false);
      });
  }, [searchQuery]);
  
  const renderStars = (averageRating) => {
    const rating = parseFloat(averageRating) || 0;
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={`text-xl ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
    ));
  };
  
  const renderRating = (ratingSum, ratingCount) => {
    if (ratingCount === 0) return "Brak ocen";
    const averageRating = ratingSum / ratingCount;
    return (
      <div className="flex items-center">
        <div className="flex mr-2">
          {renderStars(averageRating)}
        </div>
        <span className="text-yellow-500 mr-1">{averageRating.toFixed(1)}</span>
        <span className="text-gray-600">({ratingCount} {ratingCount === 1 ? 'ocena' : 
          ratingCount < 5 ? 'oceny' : 'ocen'})</span>
      </div>
    );
  };
  
  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white bg-opacity-80 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {searchQuery ? `Wyniki wyszukiwania dla: "${searchQuery}"` : 'Wyszukiwarka gier'}
      </h2>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Wyszukiwanie...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {searchQuery ? 'Nie znaleziono gier pasujących do zapytania.' : 'Wpisz frazę, aby wyszukać gry.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map(game => (
            <div key={game.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-[#0077ff] mb-2">{game.name}</h3>
              {game.release_date && (
                <p className="text-gray-600 mb-2">
                  Data wydania: {new Date(game.release_date).toLocaleDateString()}
                </p>
              )}
              <div className="mt-2">
                {renderRating(game.rating_sum, game.rating_count)}
              </div>
              <Link 
                to={`/?game=${game.id}`}
                className="mt-3 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Zobacz szczegóły
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;