import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import NavBar from "./components/navBar";
import GameList from "./components/GameList";

function App() {
    return (
      <>
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </BrowserRouter>
        <NavBar></NavBar>
        <GameList></GameList>
        </>
    );
}

export default App;