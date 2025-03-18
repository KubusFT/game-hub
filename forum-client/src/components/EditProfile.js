import React, { useState, useEffect } from 'react';
import Nav from './Nav';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstname: '',
    lastname: '',
    birthdate: '',
    bio: ''
  });

  const userId = localStorage.getItem('_id');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:4000/api/user/${userId}`)
      .then(response => response.json())
      .then(data => {
        // Convert date to yyyy-MM-dd format
        if (data.birthdate) {
          data.birthdate = data.birthdate.split('T')[0];
        }
        setFormData(data);
      })
      .catch(err => console.error(err));
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const dataToSend = { ...formData };
  
    fetch(`http://localhost:4000/api/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        navigate(`/user/${userId}`);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  return (<>
    <Nav></Nav><br></br>
    <form onSubmit={handleSubmit} className='profile-form' autocomplete="off">
      <label className='profile-label'>
        Nazwa użytkownika:
        <input type="text" name="username" value={formData.username} onChange={handleChange} className='profile-input'/>
      </label>
      <label className='profile-label'>
        Adres email:
        <input type="email" name="email" value={formData.email} onChange={handleChange} className='profile-input'/>
      </label>
      <label className='profile-label'>
        Imię:
        <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} className='profile-input'/>
      </label>
      <label className='profile-label'>
        Nazwisko:
        <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} className='profile-input'/>
      </label>
      <label className='profile-label'>
        Data urodzenia:
        <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} className='profile-input'/>
      </label>
      <label className='profile-label'>
        Bio:
        <textarea name="bio" value={formData.bio} onChange={handleChange} className='profile-input profile-textarea'/>
      </label>
      <button type="submit" className='profile-submit'>Zaktualizuj profil</button>
    </form></>
  );
};

export default EditProfile;