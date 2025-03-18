import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Nav from './Nav';

const Produkt = () => {
    const { id } = useParams(); // Pobranie ID wątku z URL
    const [threadData, setThreadData] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchReplies = async () => {
            console.log('id:', id);
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
                console.log('data:', data);
                setThreadData(data);

            } catch (err) {
                console.error(err);
            }
        };
        fetchReplies();
    }, [id]);

    // Jeśli dane wątku nie są jeszcze załadowane, wyświetl ładowanie
    if (!threadData) {
        return <p>Ładowanie...</p>;
    }

    // Generowanie URL do pliku
    const fileUrl = `http://localhost:4000/uploads/${threadData.filename}`;

    return (
        <>
        <Nav></Nav>
        <div className="thread">
            <div className="advertisement">
                <h2 style={{color: '#666'}}>Produkt:</h2>
                <h3 style={{color: '#999'}}>{threadData.product}</h3><br></br>
                <h3>Opis:</h3>
                <p>{threadData.opis}</p>
                <h3>Cena:</h3>
                <p>{threadData.cena}</p>
                <h3>Autor ogłoszenia:</h3>
                <p>{threadData.threadAuthor.name}</p>
                <h3>Numer telefonu:</h3>
                <p>{threadData.numer}</p>
                <h3>Zdjęcie:</h3>
                <img src={fileUrl} alt="Zdjęcie" />
            </div>
        </div></>
    );
};

export default Produkt;