import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Board from "./components/board";
import {
  Position,
  generateSequence,
  playLetter,
  checkMatch,
} from "./components/utils/gameLogic";

function App() {
  const [n, setN] = useState(2);

  // Track actual matches in the sequence
  const [tileMatches, setTileMatches] = useState(0);
  const [soundMatches, setSoundMatches] = useState(0);

  // Track correct/wrong guesses
  const [tileCorrect, setTileCorrect] = useState(0);
  const [tileWrong, setTileWrong] = useState(0);
  const [soundCorrect, setSoundCorrect] = useState(0);
  const [soundWrong, setSoundWrong] = useState(0);

  // Round control
  const [round, setRound] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [letters, setLetters] = useState<string[]>([]);
  const [highlighted, setHighlighted] = useState<Position | null>(null);
  const [isGameRunning, setIsGameRunning] = useState(false);

  // Flash states (red = wrong/missed, green = correct)
  const [leftBackground, setLeftBackground] = useState(false);   // audio side
  const [rightBackground, setRightBackground] = useState(false); // tile side
  const [leftGreenBackground, setLeftGreenBackground] = useState(false);   
  const [rightGreenBackground, setRightGreenBackground] = useState(false);  

  // --- Refs to track "did we guess this round?" without causing re-renders ---
  const didGuessTileRef = useRef(false);
  const didGuessSoundRef = useRef(false);

  // --------------------------------------------------------------------------
  //                         START / STOP
  // --------------------------------------------------------------------------
  const startGame = () => {
    const { positions: newPositions, letters: newLetters } = generateSequence(40);
    setPositions(newPositions);
    setLetters(newLetters);

    // Reset states
    setRound(0);
    setHighlighted(null);
    setIsGameRunning(true);

    setTileMatches(0);
    setSoundMatches(0);
    setTileCorrect(0);
    setTileWrong(0);
    setSoundCorrect(0);
    setSoundWrong(0);

    // Reset flash states
    setLeftBackground(false);
    setRightBackground(false);
    setLeftGreenBackground(false);
    setRightGreenBackground(false);

    // Reset refs
    didGuessTileRef.current = false;
    didGuessSoundRef.current = false;
  };

  const stopGame = () => {
    setIsGameRunning(false);
    setHighlighted(null);
    setRound(0);
  };

  // --------------------------------------------------------------------------
  //                      HANDLE KEY PRESSES
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Press Space to start
      if (event.key === " ") {
        if (!isGameRunning) {
          startGame();
        }
        return;
      }

      // Press Escape to stop
      if (event.key === "Escape") {
        if (isGameRunning) {
          stopGame();
        }
        return;
      }

      // If the game is running, check user input
      if (isGameRunning) {
        const [visualMatch, audioMatch] = checkMatch(round, positions, letters, n);

        switch (event.key.toLowerCase()) {
          case "p": // guessed tile
            didGuessTileRef.current = true;
            if (visualMatch) {
              // correct tile
              setTileCorrect((prev) => prev + 1);
              setRightGreenBackground(true);
              setTimeout(() => setRightGreenBackground(false), 300);
            } else {
              // wrong tile
              setTileWrong((prev) => prev + 1);
              setRightBackground(true);
              setTimeout(() => setRightBackground(false), 300);
            }
            break;

          case "w": // guessed sound
            didGuessSoundRef.current = true;
            if (audioMatch) {
              // correct sound
              setSoundCorrect((prev) => prev + 1);
              setLeftGreenBackground(true);
              setTimeout(() => setLeftGreenBackground(false), 300);
            } else {
              // wrong sound
              setSoundWrong((prev) => prev + 1);
              setLeftBackground(true);
              setTimeout(() => setLeftBackground(false), 300);
            }
            break;

          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGameRunning, round, positions, letters, n]);

  // --------------------------------------------------------------------------
  //                          ROUND FLOW
  // --------------------------------------------------------------------------
  useEffect(() => {
    // If the game isn't running, do nothing
    if (!isGameRunning) return;

    // If we've finished all positions, stop
    if (round >= positions.length) {
      setIsGameRunning(false);
      return;
    }

    // Check if there's a tile or sound match this round
    const [visualMatch, audioMatch] = checkMatch(round, positions, letters, n);

    // Increment the "actual match" counters
    if (visualMatch) {
      setTileMatches((prev) => prev + 1);
    }
    if (audioMatch) {
      setSoundMatches((prev) => prev + 1);
    }

    // At the start of the round, highlight and play
    setHighlighted(positions[round]);
    playLetter(letters[round]);

    // Reset the guess refs to false at round start
    didGuessTileRef.current = false;
    didGuessSoundRef.current = false;

    // After 2 seconds, end the round
    const timer = setTimeout(() => {
      // Stop highlighting
      setHighlighted(null);

      // Did the user MISS a tile match?
      if (visualMatch && !didGuessTileRef.current) {
        setTileWrong((prev) => prev + 1);
        setRightBackground(true);
        setTimeout(() => setRightBackground(false), 300);
      }

      // Did the user MISS a sound match?
      if (audioMatch && !didGuessSoundRef.current) {
        setSoundWrong((prev) => prev + 1);
        setLeftBackground(true);
        setTimeout(() => setLeftBackground(false), 300);
      }

      // Move to next round
      setRound((prev) => prev + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isGameRunning, round, positions, letters, n]);

  // --------------------------------------------------------------------------
  //                          SCORE CALC
  // --------------------------------------------------------------------------
  const tileScorePercent =
    tileMatches === 0
      ? 0
      : Math.max(0, (tileCorrect - tileWrong) / tileMatches) * 100;

  const soundScorePercent =
    soundMatches === 0
      ? 0
      : Math.max(0, (soundCorrect - soundWrong) / soundMatches) * 100;

  // --------------------------------------------------------------------------
  //                           RENDER
  // --------------------------------------------------------------------------
  return (
    <div
      id="app"
      className={`
        ${leftBackground ? "left-red" : ""} 
        ${rightBackground ? "right-red" : ""}
        ${leftGreenBackground ? "left-green" : ""}
        ${rightGreenBackground ? "right-green" : ""}
      `}
      style={{ textAlign: "center", padding: "20px" }}
    >
      {/* SCORES ALWAYS VISIBLE */}
      <div>
        <p className="gray-text">Tiles: {tileScorePercent.toFixed(2)}</p>
        <p className="gray-text">Sounds: {soundScorePercent.toFixed(2)}</p>
        <p className="gray-text">Round: {round}</p>

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

      {/* START / STOP */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={startGame} disabled={isGameRunning}>
          Start
        </button>
        <button onClick={stopGame} disabled={!isGameRunning}>
          Stop
        </button>
      </div>

      {/* INSTRUCTIONS */}
      <div
        className="instructions-container"
        style={{ marginTop: "20px", fontSize: "0.9rem" }}
      >
        <p className="gray-text">
          For a tone match<br />
          Press <strong>w</strong>
        </p>
        <p className="gray-text">
          For a tile match<br />
          Press <strong>p</strong>
        </p>
      </div>

      <p className="light-gray-text">
        You can also press <strong>space</strong> to start the game and{" "}
        <strong>escape</strong> to exit it.
      </p>
    </div>
  );
}

export default App;
