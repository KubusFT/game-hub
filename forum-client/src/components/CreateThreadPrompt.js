import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreateThreadPrompt = () => {
    const navigate = useNavigate();

    const handleCreateThread = () => {
        navigate('/createthread');
    };

    return (
        <div className="create-thread-prompt">
            <h2>Chcesz podzielić się swoimi myślami? Stwórz nowy wątek!</h2><br></br>
            <button className="shoutbox-button" onClick={handleCreateThread}>Stwórz wątek</button>
        </div>
    );
};

export default CreateThreadPrompt;