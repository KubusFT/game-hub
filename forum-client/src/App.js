import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import Replies from "./components/Replies";
import Profile from './components/Profile';
import EditProfile from "./components/EditProfile";
import CreateThread from "./components/CreateThread";
import SearchResults from "./components/SearchResults";
import EditPost from "./components/EditPost";
import Produkt from "./components/Produkt";

const App = () => {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/dashboard' element={<Home />} />
                    <Route path='/:id/replies' element={<Replies />} />
                    <Route path="/user/:id" element={<Profile />} />
                    <Route path="/editprofile" element={<EditProfile />} />
                    <Route path="/createthread" element={<CreateThread />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/editthread/:id" element={<EditPost />} />
                    <Route path="/produkt/:id" element={<Produkt />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;
