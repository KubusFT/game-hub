import React, { Component } from 'react'
import './navbar.css';
import logo from '../assets/kot.png'; 

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">O Stronie</a></li>
        <li><a href="#contact">Kontakt</a></li>
      </ul>
    </nav>
  );
};

export default NavBar;