import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, NavLink, redirect } from "react-router-dom";
import Nav from './Nav';

const Replies = () => {
    const [replyList, setReplyList] = useState([]);
    const [reply, setReply] = useState("");
    const [title, setTitle] = useState("");
	const [post, setPost] = useState("");
    const [author, setAuthor] = useState("");
    const navigate = useNavigate();
    const { id } = useParams();
    const [youtubeLink, setYoutubeLink] = useState("");
    const [showAddLink, setShowAddLink] = useState(false);
    const [videoId, setVideoId] = useState(null);
    const [isEdited, setIsEdited] = useState(false);
    const [product, setProduct] = useState(null);
    


    const addYoutubeLink = (e) => {
        e.preventDefault();
        fetch("http://localhost:4000/api/thread/addYoutubeLink", {
            method: "POST",
            body: JSON.stringify({
                id,
                youtubeLink,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                alert(data.message);
                setShowAddLink(false);
                setIsEdited(true);
            })
            .catch((err) => console.error(err));
    };

    const deleteThread = (threadId) => {
        fetch(`http://localhost:4000/api/thread/${threadId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                alert(data.message);
                navigate('/dashboard');
            })
            .catch((err) => console.error(err));
    };

    const addReply = () => {
        const userId = localStorage.getItem("_id");
        fetch("http://localhost:4000/api/create/reply", {
            method: "POST",
            body: JSON.stringify({
                id,
                userId,
                reply,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                alert(data.message);
                window.location.reload();
            })
            .catch((err) => console.error(err));
    };
    const handleSubmitReply = (e) => {
        e.preventDefault();
        addReply();
        setReply("");
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchReplies = async () => {
            try {
                const response = await fetch("http://localhost:4000/api/thread/replies", {
                    method: "POST",
                    body: JSON.stringify({
                        id,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                setReplyList(data.replies.filter(reply => reply.author.id !== null));
                setTitle(data.title);
                setPost(data.post);
                setAuthor(data.threadAuthor);
                setYoutubeLink(data.youtubeLink); 
                setProduct(data.product);
    
                if (data.youtubeLink) {
                    const match = data.youtubeLink.match(/v=([^&]+)/);
                    if (match) {
                        setVideoId(match[1]);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchReplies();
    }, [id]);
    
    useEffect(() => {
        if (youtubeLink) {
            const match = youtubeLink.match(/v=([^&]+)/);
            if (match) {
                setVideoId(match[1]);
            }
        }
    }, [youtubeLink]);

    return (
        <><Nav /><br></br>
        <main className='replies'>
            <h1 className='repliesTitle'>{title}</h1>
            <h3 className='repliesPost'>{post}</h3><br></br>
            <p className='postAuthor'>Autor: <Link to={`/user/${author.id}`} className="username-link">{author.name}</Link></p> 
            {product && ( // Jeśli produkt istnieje, wyświetlamy przycisk
                <button className="shoutbox-button" style={{width: '15%'}} onClick={() => navigate(`/produkt/${id}`)}>Pokaż produkt</button>
            )}
            {localStorage.getItem("_id") === author.id && (
                <div className="dropdown-container">
                <button className="shoutbox-button"onClick={() => deleteThread(id)}>Usuń post</button> 
                <button className="shoutbox-button"onClick={() => setShowAddLink(true)}>Dodaj filmik</button>
                <button className="shoutbox-button" onClick={() => navigate(`/editthread/${id}`)}>Edytuj post</button>

                    {showAddLink && (
                        <form onSubmit={addYoutubeLink}>
                        <input
                            value={youtubeLink}
                            onChange={(e) => setYoutubeLink(e.target.value)}
                            type='text'
                            placeholder='Wklej link do YouTube'
                            className="profile-input"
                        />
                        <button type='submit'>Dodaj</button>
                        </form>
        )}
    </div>
)}

            {videoId && (
                <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
            )}

            <form className='modal__content' onSubmit={handleSubmitReply} autocomplete="off">
                <label htmlFor='reply'>Odpowiedz na wątek</label>
                <textarea
                    rows={5}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    type='text'
                    name='reply'
                    className='modalInput profile-textarea'
                />

                <button className='modalBtn'>WYŚLIJ</button>
            </form>

            <div className='thread_container'>
            {replyList.map((reply) => (
                <div className='thread__item'>
                    <p>{reply.text}</p>
                <div className='react__container'>
                    <p style={{ opacity: "0.5" }}>przez <Link to={`/user/${reply.author.id}`} className="username-link">{reply.author.name}</Link></p>
                </div>
            </div>
        ))}
            </div>
        </main></>
    );
};

export default Replies;