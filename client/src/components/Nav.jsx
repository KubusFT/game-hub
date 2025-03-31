import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import logo from "../assets/kot.png";

const Nav = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  const signOut = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="flex items-center bg-[#0077ff] px-4 py-2">
  {/* Logo section with fixed width */}
  <div className="w-1/4">
    <Link to="/" className="text-2xl font-bold">
      <img src={logo} alt="Logo" className="h-10 w-auto" />
    </Link>
  </div>
  
  {/* Search section with fixed width and perfect centering */}
  <div className="w-2/4 flex justify-center">
    <form onSubmit={handleSearch} className="flex items-center w-full max-w-md">
      <input
        type="text"
        placeholder="Szukaj..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-1 rounded-l-sm border-[#005fcc] border-1 outline-none w-full"
      />
      <button type="submit" className="p-2 bg-[#005fcc] text-white rounded-r border-0 cursor-pointer">
        <FaSearch />
      </button>
    </form>
  </div>
  
  {/* User section with fixed width */}
  <div className="w-1/4 flex justify-end">
    {user ? (
      <>
        <p className="text-white mr-4 py-2">Witaj, {user.username}!</p>
        <button 
          onClick={signOut} 
          className="px-4 py-2 bg-[#ff4d4f] text-white rounded border-0 cursor-pointer"
        >
          Wyloguj
        </button>
      </>
    ) : (
      <>
        <Link to="/login" className="text-white no-underline mr-4">Logowanie</Link>
        <Link to="/register" className="text-white no-underline">Rejestracja</Link>
      </>
    )}
  </div>
</nav>
  );
};

export default Nav;