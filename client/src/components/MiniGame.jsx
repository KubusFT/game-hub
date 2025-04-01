import React, { useState, useEffect, useRef } from 'react';

const MiniGame = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [catPosition, setCatPosition] = useState({ x: 50, y: 50 });
  const [catSize, setCatSize] = useState(50);
  const [catRotation, setCatRotation] = useState(0);
  const gameAreaRef = useRef(null);
  
  // Start gry
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setCatSize(50);
    moveCat();
  };
  
  // Obsługa kliknięcia na kota
  const handleCatClick = () => {
    if (gameActive) {
      setScore(score + 1);
      // Zmniejsz rozmiar kota z każdym złapaniem (trudniej kliknąć)
      setCatSize(Math.max(20, catSize - 1));
      // Zwiększ rotację (merdanie ogonem/kręcenie się)
      setCatRotation(catRotation + 45);
      moveCat();
    }
  };
  
  // Losowa zmiana pozycji kota
  const moveCat = () => {
    if (gameAreaRef.current) {
      const gameArea = gameAreaRef.current;
      const maxX = gameArea.clientWidth - catSize;
      const maxY = gameArea.clientHeight - catSize;
      
      setCatPosition({
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY)
      });
    }
  };
  
  // Timer odliczający czas gry
  useEffect(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameActive(false);
    }
    
    return () => clearTimeout(timer);
  }, [gameActive, timeLeft]);
  
  // Automatyczne poruszanie kotem co 2 sekundy
  useEffect(() => {
    let moveTimer;
    if (gameActive) {
      moveTimer = setInterval(() => {
        moveCat();
        // Merdanie - zmiana rotacji
        setCatRotation(prev => prev + 15);
      }, 2000);
    }
    
    return () => clearInterval(moveTimer);
  }, [gameActive]);
  
  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white bg-opacity-80 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Mini Gra: Catch Cute Pussy</h2>
      
      <div className="mb-4 text-center text-black">
        <p className="text-lg font-semibold">Wynik: {score}</p>
        <p className="text-md">Czas: {timeLeft} sekund</p>
      </div>
      
      <div 
        ref={gameAreaRef}
        className="relative w-full h-80 bg-blue-100 rounded-lg overflow-hidden mb-4 border-2 border-blue-300"
      >
        {gameActive ? (
          <img 
            src="/src/assets/kot.png"
            alt="Kot do złapania" 
            className="absolute cursor-pointer transition-all"
            style={{
              width: `${catSize}px`,
              height: `${catSize}px`,
              left: `${catPosition.x}px`,
              top: `${catPosition.y}px`,
              transform: `rotate(${catRotation}deg)`,
              transitionDuration: '0.2s'
            }}
            onClick={handleCatClick}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-bold mb-4 text-black">
                {score > 0 
                  ? `Gra zakończona! Twój wynik: ${score}` 
                  : 'Kliknij przycisk poniżej, aby rozpocząć grę'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <button 
          onClick={startGame}
          disabled={gameActive}
          className={`px-6 py-2 rounded-lg font-bold ${
            gameActive 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {gameActive ? 'Gra w toku...' : 'Rozpocznij grę'}
        </button>
      </div>
      
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-black">
        <h3 className="font-bold text-lg mb-2">Jak grać:</h3>
        <ol className="list-decimal pl-5">
          <li>Kliknij "Rozpocznij grę"</li>
          <li>Klikaj na kota jak najszybciej!</li>
          <li>Kot będzie się poruszał i będzie coraz trudniej go złapać</li>
          <li>Masz 30 sekund, aby zdobyć jak najwięcej punktów</li>
        </ol>
      </div>
    </div>
  );
};

export default MiniGame;