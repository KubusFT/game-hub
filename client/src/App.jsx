import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameList from "./components/GameList";
import Register from "./components/Register";
import Login from "./components/Login";
import Nav from "./components/Nav";

function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/" element={<GameList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;