import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import kotLogo from "../assets/kot.png"; // Możesz użyć innego obrazu, jeśli wolisz

const Nav = () => {
  const [user, setUser] = useState(null);
  const [isModerator, setIsModerator] = useState(false);
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

  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src={kotLogo} alt="Game Hub Logo" className="h-10 w-10 mr-2" />
          <Link to="/" className="text-xl font-bold">Game Hub</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-gray-300">Gry</Link>
          <Link to="/submit-game" className="hover:text-gray-300">Dodaj grę</Link>
          {isModerator && (
            <Link to="/moderate" className="hover:text-gray-300">Panel moderacji</Link>
          )}
          {user ? (
            <div className="flex items-center space-x-4">
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
            <div className="flex space-x-4">
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