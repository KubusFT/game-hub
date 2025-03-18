import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaSearch } from 'react-icons/fa';

const Nav = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('_id');
  const [searchTerm, setSearchTerm] = useState('');

  const signOut = () => {
    localStorage.removeItem("_id");
    navigate("/");
  };

  const handleSearch = (event) => {
    event.preventDefault();
    
    if (!searchTerm.trim()) {
      alert("Pole wyszukiwania nie może być puste.");
      return;
    }
    
    fetch(`http://localhost:4000/api/threads?tag=${searchTerm}`)
      .then(response => response.json())
      .then(data => {
        // data should be the threads that match the search term
        console.log(data);
        // navigate to the search results page
        navigate(`/search?tag=${searchTerm}`);
      })
      .catch(error => console.error(error));
};

  return (
    <nav className='navbar'>
      <Link to="/dashboard" className="forum-link"><h2>Forum</h2></Link>
      <div className="search-container">
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Szukaj..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input" 
        />
        <button type="submit" className="search-button"><FaSearch /></button>
      </form>
      </div>

      <div className='navbarRight'>
        {userId && <Link to={`/user/${userId}`} className="profile-link">Profil</Link>}
        <button className="profile-link" onClick={signOut}>Wyloguj</button>
      </div>
    </nav>
  );
};

export default Nav;