import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";

const CreateThread = () => {
    const [thread, setThread] = useState("");
    const [post, setPost] = useState("");
    const [tags, setTags] = useState("");
    const [addProduct, setAddProduct] = useState(false);
    const [product, setProduct] = useState("");
    const [opis, setOpis] = useState("");
    const [cena, setCena] = useState("");
    const [numer, setNumer] = useState("");
    const navigate = useNavigate();
    const [file, setFile] = useState(null);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file.size > 10 * 1024 * 1024) { // 10MB
    alert('File is too large, please select a file smaller than 10MB.');
    return;
  }
  if (file.type !== 'image/jpeg') {
    alert('Invalid file type, please select a JPEG image.');
    return;
  }
  setFile(file);
};


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const createThread = () => {
      const userId = localStorage.getItem("_id");
    
      if (!userId) {
        alert('User ID not found in local storage');
        return;
      }
    
      const formData = new FormData();
      formData.append('thread', thread);
      formData.append('userId', userId);
      formData.append('post', post);
      formData.append('created_at', new Date().toISOString());
      formData.append('tags', tags);
      formData.append('product', product);
      formData.append('opis', opis);
      formData.append('cena', cena);
      formData.append('numer', numer);
      formData.append('file', file);
    
      fetch("http://localhost:4000/api/create/thread", {
        method: "POST",
        body: formData,
      })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        navigate('/dashboard');
      })
      .catch((err) => console.error(err));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createThread();
        setThread("");
        setPost("");
        setTags("");
        setProduct("");
        setOpis("");
        setCena("");
        setNumer("");
    };

    return (
        <>
            <Nav />
            <main className='homewatek'>
                <h2 className='homeTitle'>Stwórz wątek</h2>
                <form className='homeForm' onSubmit={handleSubmit} autocomplete="off">
                    <div className='home__container'>
                        <label htmlFor='thread'>Tytuł</label>
                        <input
                            type='text'
                            name='thread'
                            required
                            value={thread}
                            className="profile-input"
                            onChange={(e) => setThread(e.target.value)}
                        /><br></br>
                        <label htmlFor='post'>Opis</label>
                        <textarea
                            name='post'
                            required
                            value={post}
                            className="profile-textarea"
                            onChange={(e) => setPost(e.target.value)}
                        /><br></br>
                        <label htmlFor='tags'>Tagi</label>
                        <input
                            type="text"
                            name='tags'
                            required
                            value={tags}
                            className="profile-input"
                            onChange={(e) => setTags(e.target.value)}
                        /><br></br>
                        <label>
                            <input
                                type="checkbox"
                                checked={addProduct}
                                onChange={(e) => setAddProduct(e.target.checked)}
                            />
                             Czy chcesz wystawić produkt na sprzedaż?
                        </label>
                        {addProduct && (
                            <>
                                <label htmlFor='product'>Nazwa produktu</label>
                                <input
                                    type="text"
                                    name='product'
                                    value={product}
                                    className="profile-input"
                                    onChange={(e) => setProduct(e.target.value)}
                                />
                                <label htmlFor='opis'>Opis produktu</label>
                                <textarea
                                    name='opis'
                                    required
                                    value={opis}
                                    className="profile-textarea"
                                    onChange={(e) => setOpis(e.target.value)}
                                />
                                <label htmlFor='cena'>Cena produktu</label>
                                <input
                                    type="number"
                                    name='cena'
                                    value={cena}
                                    className="profile-input"
                                    pattern="^[0-9]+\.?[0-9]{0,2}$"
                                    onChange={(e) => setCena(e.target.value)}
                                />
                                <label htmlFor='numer'>Numer telefonu</label>
                                <input
                                    type="number"
                                    name='numer'
                                    value={numer}
                                    className="profile-input"
                                    pattern="[0-9]{9}"
                                    onChange={(e) => setNumer(e.target.value)}
                                />
                                <label htmlFor="file">Zdjęcie produktu</label>
                                <input
                                    type="file"
                                    name="file"
                                    accept="image/jpg, image/jpeg, image/png"
                                    onChange={handleFileChange}
                                />
                            </>
                        )}
                    </div>
                    <button className='homeBtn'>STWÓRZ WĄTEK</button>
                </form>
            </main>
        </>
    );
};

export default CreateThread;