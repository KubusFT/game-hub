import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameList from "./components/GameList";
import Register from "./components/Register";
import Login from "./components/Login";
import Nav from "./components/Nav";
import bgImage from "./assets/tlo.PNG";

function App() {
  return (
    <div style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
      <Router>
        <Nav />
        <Routes>
          <Route path="/" element={<GameList />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;