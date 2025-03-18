import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Nav from "./Nav";
import { Link } from 'react-router-dom';
import Likes from "../utils/Likes";
import Comments from "../utils/Comments";

const SearchResults = () => {
    const [threadList, setThreadList] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const tag = new URLSearchParams(location.search).get('tag');

    useEffect(() => {
        window.scrollTo(0, 0);
        const checkUser = () => {
            if (!localStorage.getItem("_id")) {
                navigate("/");
            } else {
                fetch(`http://localhost:4000/api/threads?tag=${tag}`)
                    .then((res) => res.json())
                    .then((data) => {
                        console.log(data);
                        setThreadList(data);
                      })
                    .catch((err) => console.error(err));
            }
        };
        checkUser();
    }, [navigate, tag]);

    return (
        <>
            <Nav />
            <main className='home'>
                <div className='thread__container'>
                    <h2 className='homeTitle'>Wyniki wyszukiwania dla tagu: {tag}</h2>
                    {threadList.length > 0 ? (
                        threadList
                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                            .map((thread) => (
                                <div className='thread__itemek' key={thread.id}>
                                    <p>
                                        <Link to={`/${thread.id}/replies`} className="username-link">{thread.title}</Link>
                                    </p>
                                    <p className="thread__author-date">
                                        <span>przez </span>
                                        <Link to={`/user/${thread.authorId}`}className="username-link">{thread.authorName}</Link>
                                        <span>, </span>
                                        <span>{new Date(thread.created_at).toLocaleString()}</span>
                                    </p>
                                    <div className='react__container'>
                                        <Likes
                                            numberOfLikes={thread.likesCount}
                                            threadId={thread.id}
                                        />
                                        <Comments
                                            numberOfComments={thread.repliesCount !== undefined ? thread.repliesCount - 1 : -1}
                                            threadId={thread.id}
                                        />
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p>Brak wątków z tagiem: {tag}</p>
                    )}
                </div>
            </main>
        </>
    );
};

export default SearchResults;