import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Board from "./components/board";
import {
  Position,
  INITIAL_N,
  generateSequence,
  playLetter,
  checkMatch,
} from "./components/utils/gameLogic";

function App() {
  const [n, setN] = useState(INITIAL_N); // Current N-back level (starts at 1)
  const [score, setScore] = useState(0); // The player's score
  const [round, setRound] = useState(0); // Tracks which round we're on
  const [positions, setPositions] = useState<Position[]>([]); // Generated positions
  const [letters, setLetters] = useState<string[]>([]);       // Generated letters
  const [highlighted, setHighlighted] = useState<Position | null>(null); // Currently highlighted cell
  const [isGameRunning, setIsGameRunning] = useState(false);  // If the game is active or not

  const userVisualRef = useRef(false);
  const userAudioRef = useRef(false);

  // Initializing the game
  const startGame = () => {
    // Generate a new random sequence of 20 rounds
    const { positions: newPositions, letters: newLetters } = generateSequence(20);

    setPositions(newPositions);
    setLetters(newLetters);
    setScore(0);
    setRound(0);
    setIsGameRunning(true);
    setHighlighted(null);
  };

  const stopGame = () => {
    setIsGameRunning(false);
    setHighlighted(null);
    setRound(0);
  };

  // Capture keyboard inputs for starting/stopping the game and for user answers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Press "Space" to start the game if it's not running
      if (event.key === " ") {
        if (!isGameRunning) {
          startGame();
        }
        return; // We stop here so we don't check "w"/"p"/"Escape" in the same stroke
      }

      // Press "Escape" to stop the game if it's running
      if (event.key === "Escape") {
        if (isGameRunning) {
          stopGame();
        }
        return;
      }

      // Only check "w" or "p" if the game is running
      if (isGameRunning) {
        switch (event.key.toLowerCase()) {
          case "w":
            userAudioRef.current = true;
            break;
          case "p":
            userVisualRef.current = true;
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameRunning]);

  /**
   * For the actual flow of the game
   * Each time there's a new round, highlight a cell
   * Play its corresponding letter, wait 2 seconds, then check for matches.
   */
  useEffect(() => {
    if (!isGameRunning) return;
    if (round >= positions.length) {
      setIsGameRunning(false);
      return;
    }

    // Gets the current position and letter for the round
    const currentPosition = positions[round];
    const currentLetter = letters[round];

    setHighlighted(currentPosition);

    playLetter(currentLetter);

    const timer = setTimeout(() => {
      const [visualMatch, audioMatch] = checkMatch(round, positions, letters, n);

      // Increments the score if the player correctly found a visual match
      if (userVisualRef.current && visualMatch) {
        setScore((prev) => prev + 1);
      }

      // Increments the score if the player correctly found an audio match
      if (userAudioRef.current && audioMatch) {
        setScore((prev) => prev + 1);
      }

      // Resets player inputs
      userVisualRef.current = false;
      userAudioRef.current = false;

      setHighlighted(null);

      // Next round
      setRound((prev) => prev + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [round, isGameRunning, positions, letters, n]);

  //For rendering the app
  return (
    <div id="app" style={{ textAlign: "center", padding: "20px" }}>
      <div>
        <p className="gray-text">Score: {score}</p>
        <p className="gray-text">Round: {round}/{positions.length}</p>
        {/* Manually adjustable N-back level */}
        <div style={{ marginTop: "10px" }}>
          <p className="gray-text">Level {n}</p>
          <input
            type="range"
            id="n-back-level"
            min="1"
            max="10"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            disabled={isGameRunning}
            style={{ width: "100%", margin: "20px 0" }}
          />
        </div>
      </div>

      <Board highlighted={highlighted} />

      <div style={{ marginTop: "20px" }}>
        <button onClick={startGame} disabled={isGameRunning} style={{ marginRight: "5px" }}>
          Start
        </button>
        <button onClick={stopGame} disabled={!isGameRunning}>
          Stop
        </button>
      </div>

      <div className="instructions-container" style={{ marginTop: "20px", fontSize: "0.9rem" }}>
        <p className="gray-text">
          For a tone match<br />
          Press <strong>w</strong>
        </p>
        <p className="gray-text">
          For a tile match<br />
          Press<strong> p</strong><br></br><br></br>
        </p>
      </div>
      <p className="light-gray-text">
          You can also press <strong>space</strong> to start the game and <strong>escape</strong> to exit it.
      </p>
    </div>
  );
}

export default App;
