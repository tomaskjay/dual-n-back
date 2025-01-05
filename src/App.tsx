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

  // Track total matches (actual occurrences)
  const [tileMatches, setTileMatches] = useState(0);
  const [soundMatches, setSoundMatches] = useState(0);

  // Track correct guesses
  const [tileCorrect, setTileCorrect] = useState(0);
  const [soundCorrect, setSoundCorrect] = useState(0);

  // Track false alarms specifically (player guessed but no match)
  const [tileFalseAlarms, setTileFalseAlarms] = useState(0);
  const [soundFalseAlarms, setSoundFalseAlarms] = useState(0);

  // Round control
  const [round, setRound] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [letters, setLetters] = useState<string[]>([]);
  const [highlighted, setHighlighted] = useState<Position | null>(null);
  const [isGameRunning, setIsGameRunning] = useState(false);

  // **Green** flash states (correct guesses)
  const [leftGreenBackground, setLeftGreenBackground] = useState(false);   // correct sound
  const [rightGreenBackground, setRightGreenBackground] = useState(false); // correct tile

  // Keep track of whether the player guessed tile or sound in the current round
  const didGuessTileRef = useRef(false);
  const didGuessSoundRef = useRef(false);

  // --------------------------------------------------------------------------
  //                         START / STOP
  // --------------------------------------------------------------------------
  const startGame = () => {
    const { positions: newPositions, letters: newLetters } = generateSequence(40);
    setPositions(newPositions);
    setLetters(newLetters);

    // Reset round and game state
    setRound(0);
    setHighlighted(null);
    setIsGameRunning(true);

    // Reset match counters
    setTileMatches(0);
    setSoundMatches(0);

    // Reset correct/false alarm counters
    setTileCorrect(0);
    setSoundCorrect(0);
    setTileFalseAlarms(0);
    setSoundFalseAlarms(0);

    // Reset green flashes
    setLeftGreenBackground(false);
    setRightGreenBackground(false);

    // Reset guess flags
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

      if (isGameRunning) {
        // We only record a guess if we haven't guessed that type yet this round
        const [visualMatch, audioMatch] = checkMatch(round, positions, letters, n);

        switch (event.key.toLowerCase()) {
          case "p": // guessed tile
            if (!didGuessTileRef.current) {
              didGuessTileRef.current = true;
              if (visualMatch) {
                // Correct tile
                setTileCorrect((prev) => prev + 1);
                setRightGreenBackground(true);
                setTimeout(() => setRightGreenBackground(false), 300);
              } else {
                // False alarm (tile)
                setTileFalseAlarms((prev) => prev + 1);
              }
            }
            break;

          case "e": // guessed sound
            if (!didGuessSoundRef.current) {
              didGuessSoundRef.current = true;
              if (audioMatch) {
                // Correct sound
                setSoundCorrect((prev) => prev + 1);
                setLeftGreenBackground(true);
                setTimeout(() => setLeftGreenBackground(false), 300);
              } else {
                // False alarm (sound)
                setSoundFalseAlarms((prev) => prev + 1);
              }
            }
            break;

          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameRunning, round, positions, letters, n]);

  // --------------------------------------------------------------------------
  //                          ROUND FLOW
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isGameRunning) return;

    if (round >= positions.length) {
      setIsGameRunning(false);
      return;
    }

    const [visualMatch, audioMatch] = checkMatch(round, positions, letters, n);

    // Increment the "actual match" counters
    if (visualMatch) setTileMatches((prev) => prev + 1);
    if (audioMatch) setSoundMatches((prev) => prev + 1);

    // Highlight tile and play sound
    setHighlighted(positions[round]);
    playLetter(letters[round]);

    // Reset guess flags for this new round
    didGuessTileRef.current = false;
    didGuessSoundRef.current = false;

    // After 2 seconds, move to the next round
    const timer = setTimeout(() => {
      setHighlighted(null);
      setRound((prev) => prev + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isGameRunning, round, positions, letters, n]);

  // --------------------------------------------------------------------------
  //                          SCORE CALC
  // --------------------------------------------------------------------------
  const totalRounds = positions.length;
  const epsilon = 1e-9;

  // For tile
  const tileNonMatches = totalRounds - tileMatches;
  const tileNonGuessesCorrect = tileNonMatches - tileFalseAlarms; // didn't guess tile & wasn't a match

  // For sound
  const soundNonMatches = totalRounds - soundMatches;
  const soundNonGuessesCorrect = soundNonMatches - soundFalseAlarms; // didn't guess sound & wasn't a match

  // The scores are used only at the end, but let's keep them for the final breakdown.
  const tileScore =
    100 *
    ((
      (tileCorrect / (tileMatches + epsilon)) +
      0.5 * (tileNonGuessesCorrect / (tileNonMatches + epsilon)) -
      (tileFalseAlarms / (tileNonMatches + epsilon))
    ) /
      1.5);

  const soundScore =
    100 *
    ((
      (soundCorrect / (soundMatches + epsilon)) +
      0.5 * (soundNonGuessesCorrect / (soundNonMatches + epsilon)) -
      (soundFalseAlarms / (soundNonMatches + epsilon))
    ) /
      1.5);

  const overallScore = (tileScore + soundScore) / 2;

  // --------------------------------------------------------------------------
  //                           RENDER
  // --------------------------------------------------------------------------
  return (
    <div
      id="app"
      // Only green classes for correct guesses
      className={`
        ${leftGreenBackground ? "left-green" : ""}
        ${rightGreenBackground ? "right-green" : ""}
      `}
      style={{ textAlign: "center", padding: "20px" }}
    >
      {/* ---------------- LIVE COUNTER DISPLAY ---------------- */}
      <div style={{ fontSize: "0.9rem", marginBottom: "20px" }}>
        <h4>Tile Counters</h4>
        <p className="gray-text">tileCorrect: {tileCorrect}</p>
        <p className="gray-text">tileMatches: {tileMatches}</p>
        <p className="gray-text">tileNonGuessesCorrect: {tileNonGuessesCorrect}</p>
        <p className="gray-text">tileNonMatches: {tileNonMatches}</p>
        <p className="gray-text">tileFalseAlarms: {tileFalseAlarms}</p>

        <h4>Sound Counters</h4>
        <p className="gray-text">soundCorrect: {soundCorrect}</p>
        <p className="gray-text">soundMatches: {soundMatches}</p>
        <p className="gray-text">soundNonGuessesCorrect: {soundNonGuessesCorrect}</p>
        <p className="gray-text">soundNonMatches: {soundNonMatches}</p>
        <p className="gray-text">soundFalseAlarms: {soundFalseAlarms}</p>
      </div>

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

      <Board highlighted={highlighted} />

      <div style={{ marginTop: "20px" }}>
        <button onClick={startGame} disabled={isGameRunning}>
          Start
        </button>
        <button onClick={stopGame} disabled={!isGameRunning}>
          Stop
        </button>
      </div>

      <div
        className="instructions-container"
        style={{ marginTop: "20px", fontSize: "0.9rem" }}
      >
        <p className="gray-text">
          For a tone match<br />
          Press <strong>e</strong>
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

      {/* ---------------- SCORE BREAKDOWN AFTER GAME ---------------- */}
      {!isGameRunning && round > 0 && (
        <div style={{ marginTop: "30px", textAlign: "left" }}>
          <h2>Results</h2>
          <p>
            <strong>Overall Score:</strong> {overallScore.toFixed(1)}%
          </p>
          <p>
            <strong>Tile Score:</strong> {tileScore.toFixed(1)}%
            <br />
            <strong>Sound Score:</strong> {soundScore.toFixed(1)}%
          </p>

          <h3 style={{ marginTop: "20px" }}>Tile Breakdown:</h3>
          <p>
            • Correct Guesses: {tileCorrect}/{tileMatches}{" "}
            ({(tileMatches === 0 ? 0 : (tileCorrect / tileMatches) * 100).toFixed(0)}%)
          </p>
          <p>
            • False Alarms: {tileFalseAlarms}/{tileNonMatches}{" "}
            (
            {tileNonMatches === 0
              ? 0
              : ((-tileFalseAlarms / tileNonMatches) * 100).toFixed(0)}
            %)
          </p>
          <p>
            • Neutral Accuracy: {tileNonGuessesCorrect}/{tileNonMatches}{" "}
            (
            {tileNonMatches === 0
              ? 0
              : ((tileNonGuessesCorrect / tileNonMatches) * 100).toFixed(0)}
            %)
          </p>

          <h3 style={{ marginTop: "20px" }}>Sound Breakdown:</h3>
          <p>
            • Correct Guesses: {soundCorrect}/{soundMatches}{" "}
            (
            {soundMatches === 0
              ? 0
              : ((soundCorrect / soundMatches) * 100).toFixed(0)}
            %)
          </p>
          <p>
            • False Alarms: {soundFalseAlarms}/{soundNonMatches}{" "}
            (
            {soundNonMatches === 0
              ? 0
              : ((-soundFalseAlarms / soundNonMatches) * 100).toFixed(0)}
            %)
          </p>
          <p>
            • Neutral Accuracy: {soundNonGuessesCorrect}/{soundNonMatches}{" "}
            (
            {soundNonMatches === 0
              ? 0
              : ((soundNonGuessesCorrect / soundNonMatches) * 100).toFixed(0)}
            %)
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
