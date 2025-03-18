import React, { useState, useEffect } from 'react';
import Nav from './Nav';
import { useNavigate, useParams } from 'react-router-dom';

const EditPost = () => {
  const [formData, setFormData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:4000/api/thread/${id}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          console.log('Received data from server:', data);
          const newData = { title: data.title || "", post: data.post || "" }; // Copy data to a new object
          setFormData(newData);
        } else {
          console.log('No data received from server');
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    console.log(`Changing ${e.target.name} to ${e.target.value}`); // Log the change
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const dataToSend = { ...formData };
    console.log('Sending data:', dataToSend); // Log the data to be sent
  
    fetch(`http://localhost:4000/api/thread/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response from server:', data); // Log the server response
        navigate(`/${id}/replies`);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (<>
    <Nav></Nav><br></br>
    <form onSubmit={handleSubmit} className='profile-form' autoComplete="off">
      <label className='profile-label'>
        Tytuł postu:
        <input type="text" name="title" value={formData.title} onChange={handleChange} className='profile-input'/>
      </label>
      <label className='profile-label'>
        Treść postu:
        <textarea name="post" value={formData.post} onChange={handleChange} className='profile-input profile-textarea'/>
      </label>
      <button type="submit" className='profile-submit'>Zaktualizuj post</button>
    </form></>
  );
};

export default EditPost;