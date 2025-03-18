import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from './Nav';

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      if (!localStorage.getItem('_id')) {
        navigate('/');
      } else {
        fetch(`http://localhost:4000/api/user/${id}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
          })
          .then(text => {
            try {
              return JSON.parse(text);
            } catch (error) {
              console.error('Parsing error:', error);
              throw error;
            }
          })
          .then(data => { 
            if (data.birthdate) {
              let date = new Date(data.birthdate);
              let localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
              data.birthdate = localDate.toISOString().split('T')[0];
            }
            setUser(data);
          })
          .catch(error => console.error('Error:', error));
      }
    };
    checkUser();
  }, [id, navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const loggedInUserId = localStorage.getItem('_id'); // Pobierz id zalogowanego użytkownika

  return (
    <>
    <Nav /><br></br>
    <div className="profile-container">
          <h3>Nazwa użytkownika:</h3>
          <p>{user.username}</p>
          <h3>Adres email:</h3>
          <p>{user.email}</p>
          <h3>Imię:</h3>
          <p>{user.firstname}</p>
          <h3>Nazwisko:</h3>
          <p>{user.lastname}</p>
          <h3>Data urodzenia:</h3>
          <p>{user.birthdate.slice(0, 10)}</p>
          <h3>Bio:</h3>
          <p>{user.bio}</p>
          {loggedInUserId === id && <button className="profile-submit" onClick={() => navigate(`/editprofile`)}>Edytuj profil</button>}
          </div></>
  );
}

export default Profile;