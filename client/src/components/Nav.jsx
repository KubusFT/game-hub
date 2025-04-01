import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import kotLogo from "../assets/kot.png";

const Nav = () => {
  const [user, setUser] = useState(null);
  const [isModerator, setIsModerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem("user") || "null");
    setUser(loggedInUser);
    
    // Sprawdź, czy użytkownik jest moderatorem
    if (loggedInUser) {
      fetch(`http://localhost:4000/api/users/${loggedInUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.role === 'moderator' || data.role === 'admin') {
            setIsModerator(true);
          }
        })
        .catch(err => console.error('Error fetching user data:', err));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    setIsModerator(false);
    navigate("/");
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
        <div className="flex items-center">
          <img src={kotLogo} alt="Game Hub Logo" className="h-10 w-10 mr-2" />
          <Link to="/" className="text-xl font-bold">Game Hub</Link>
        </div>
        
        {/* Wyszukiwarka */}
        <div className="flex-grow max-w-md mx-auto md:mx-0 md:ml-8">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj gier..."
              className="flex-grow px-4 py-2 text-sm text-gray-900 bg-white rounded-l-lg focus:outline-none"
            />
            <button 
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-r-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-end items-center space-x-2 md:space-x-4">
          <Link to="/" className="hover:text-gray-300">Gry</Link>
          <Link to="/submit-game" className="hover:text-gray-300">Dodaj grę</Link>
          <Link to="/mini-game" className="hover:text-gray-300 flex items-center">
            <span className="animate-bounce">🎮</span> Mini Gra
          </Link>
          {isModerator && (
            <Link to="/moderate" className="hover:text-gray-300">Panel moderacji</Link>
          )}
          {user ? (
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to={`/profile/${user.id}`} className="hover:text-gray-300">
                Profil {user.username}
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Wyloguj
              </button>
            </div>
          ) : (
            <div className="flex space-x-2 md:space-x-4">
              <Link to="/login" className="hover:text-gray-300">Logowanie</Link>
              <Link to="/register" className="hover:text-gray-300">Rejestracja</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;