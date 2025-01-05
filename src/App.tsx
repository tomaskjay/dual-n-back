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

  // Track false alarms (player guessed but no match)
  const [tileFalseAlarms, setTileFalseAlarms] = useState(0);
  const [soundFalseAlarms, setSoundFalseAlarms] = useState(0);

  // Round control
  const [round, setRound] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [letters, setLetters] = useState<string[]>([]);
  const [highlighted, setHighlighted] = useState<Position | null>(null);
  const [isGameRunning, setIsGameRunning] = useState(false);

  // Green flash states (correct guesses)
  const [leftGreenBackground, setLeftGreenBackground] = useState(false);  // correct sound
  const [rightGreenBackground, setRightGreenBackground] = useState(false); // correct tile

  // Keep track of whether the player guessed tile or sound in the current round
  const didGuessTileRef = useRef(false);
  const didGuessSoundRef = useRef(false);

  // When user clicks “tone match” or “tile match,” briefly show that it was clicked
  const [toneClicked, setToneClicked] = useState(false);
  const [tileClicked, setTileClicked] = useState(false);

  // --------------------------------------------------------------------------
  //                         START / STOP
  // --------------------------------------------------------------------------
  const startGame = () => {
    const { positions: newPositions, letters: newLetters } = generateSequence(20);
    setPositions(newPositions);
    setLetters(newLetters);

    // Reset round and game state
    setRound(0);
    setIsGameRunning(true);
    setHighlighted(null);

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
  //             HELPER FUNCTIONS FOR CLICKING “TONE MATCH” OR “TILE MATCH”
  // --------------------------------------------------------------------------
  const guessSound = () => {
    // Provide some “clicked” feedback
    setToneClicked(true);
    setTimeout(() => setToneClicked(false), 150);

    // Only do logic if game is running
    if (!isGameRunning) return;

    const [visualMatch, audioMatch] = checkMatch(round, positions, letters, n);
    if (!didGuessSoundRef.current) {
      didGuessSoundRef.current = true;
      if (audioMatch) {
        // Correct sound
        setSoundCorrect((prev) => prev + 1);
        setLeftGreenBackground(true);
        setTimeout(() => setLeftGreenBackground(false), 1000);
      } else {
        // False alarm (sound)
        setSoundFalseAlarms((prev) => prev + 1);
      }
    }
  };

  const guessTile = () => {
    // Provide some “clicked” feedback
    setTileClicked(true);
    setTimeout(() => setTileClicked(false), 150);

    // Only do logic if game is running
    if (!isGameRunning) return;

    const [visualMatch, audioMatch] = checkMatch(round, positions, letters, n);
    if (!didGuessTileRef.current) {
      didGuessTileRef.current = true;
      if (visualMatch) {
        // Correct tile
        setTileCorrect((prev) => prev + 1);
        setRightGreenBackground(true);
        setTimeout(() => setRightGreenBackground(false), 1000);
      } else {
        // False alarm (tile)
        setTileFalseAlarms((prev) => prev + 1);
      }
    }
  };

  // --------------------------------------------------------------------------
  //                      HANDLE KEY PRESSES
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 1) Ignore repeated events while a key is held down
      if (event.repeat) return;

      // 2) Prevent default for space so it doesn't scroll the page
      if (event.key === " ") {
        event.preventDefault();
      }

      // Press Space to start (if not running)
      if (event.key === " ") {
        if (!isGameRunning) {
          startGame();
        }
        return;
      }

      // Press Escape to stop (if running)
      if (event.key === "Escape") {
        if (isGameRunning) {
          stopGame();
        }
        return;
      }

      // Handle "p" or "e" only if the game is running
      if (isGameRunning) {
        const [visualMatch, audioMatch] = checkMatch(round, positions, letters, n);

        switch (event.key.toLowerCase()) {
          case "p": // guessed tile
            if (!didGuessTileRef.current) {
              didGuessTileRef.current = true;
              if (visualMatch) {
                // Correct tile
                setTileCorrect((prev) => prev + 1);
                setRightGreenBackground(true);
                setTimeout(() => setRightGreenBackground(false), 1000);
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
                setTimeout(() => setLeftGreenBackground(false), 1000);
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
  }, [isGameRunning, round, positions, letters, n]);

  // --------------------------------------------------------------------------
  //                          ROUND FLOW
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isGameRunning) return;

    // If positions not ready or length is 0, skip
    if (positions.length === 0) return;

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

  // Final scoring
  const tileScore =
    100 *
    ((tileCorrect / (tileMatches + epsilon) +
      0.5 * (tileNonGuessesCorrect / (tileNonMatches + epsilon)) -
      tileFalseAlarms / (tileNonMatches + epsilon)) /
      1.5);

  const soundScore =
    100 *
    ((soundCorrect / (soundMatches + epsilon) +
      0.5 * (soundNonGuessesCorrect / (soundNonMatches + epsilon)) -
      soundFalseAlarms / (soundNonMatches + epsilon)) /
      1.5);

  const overallScore = (tileScore + soundScore) / 2;

  // --------------------------------------------------------------------------
  //                           RENDER
  // --------------------------------------------------------------------------
  return (
    <div
      id="app"
      className={`
        ${leftGreenBackground ? "left-green" : ""}
        ${rightGreenBackground ? "right-green" : ""}
      `}
    >
      {/* --------------- LEVEL SLIDER (only when NOT playing) --------------- */}
      {!isGameRunning && (
        <div style={{ marginBottom: "1rem" }}>
          <p className="gray-text" style={{ margin: "0.5rem 0" }}>
            Level {n}
          </p>
          <input
            type="range"
            id="n-back-level"
            min="1"
            max="10"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            style={{ width: "400px" }}
          />
        </div>
      )}

      {/* --------------- MAIN CONTENT AREA: Board (if playing) or Results --------------- */}
      <div style={{ width: "300px", minHeight: "300px" }}>
        {isGameRunning ? (
          // Show Board with fade-in
          <div className="fade">
            <Board highlighted={highlighted} />
          </div>
        ) : round > 0 ? (
          // Show Results with fade-in after game ends
          <div className="fade gray-text" style={{ textAlign: "left" }}>
            <h4 style={{ marginTop: "20px" }}>Overall Score {overallScore.toFixed(1)}%</h4>
            <p>• Tile Score: {tileScore.toFixed(1)}%</p>
            <p>• Sound Score: {soundScore.toFixed(1)}%</p>

            <h4 style={{ marginTop: "20px" }}>Tiles:</h4>
            <p>
              • Correct Guesses: {tileCorrect}/{tileMatches} (
              {tileMatches === 0
                ? 0
                : ((tileCorrect / tileMatches) * 100).toFixed(0)}
              %)
            </p>
            <p>
              • False Alarms: {tileFalseAlarms}/{tileNonMatches} (
              {tileNonMatches === 0
                ? 0
                : ((-tileFalseAlarms / tileNonMatches) * 100).toFixed(0)}
              %)
            </p>
            <p>
              • Neutral Accuracy: {tileNonGuessesCorrect}/{tileNonMatches} (
              {tileNonMatches === 0
                ? 0
                : (
                    (tileNonGuessesCorrect / tileNonMatches) *
                    100
                  ).toFixed(0)}
              %)
            </p>

            <h4 style={{ marginTop: "20px" }}>Sounds:</h4>
            <p>
              • Correct Guesses: {soundCorrect}/{soundMatches} (
              {soundMatches === 0
                ? 0
                : ((soundCorrect / soundMatches) * 100).toFixed(0)}
              %)
            </p>
            <p>
              • False Alarms: {soundFalseAlarms}/{soundNonMatches} (
              {soundNonMatches === 0
                ? 0
                : ((-soundFalseAlarms / soundNonMatches) * 100).toFixed(0)}
              %)
            </p>
            <p>
              • Neutral Accuracy: {soundNonGuessesCorrect}/{soundNonMatches} (
              {soundNonMatches === 0
                ? 0
                : (
                    (soundNonGuessesCorrect / soundNonMatches) *
                    100
                  ).toFixed(0)}
              %)
            </p>
          </div>
        ) : (
          // Show nothing if game not started yet
          <div style={{ height: "100%", display: "flex", alignItems: "center" }}>
            <p style={{ margin: "auto", color: "#777" }}>
              <strong>Start</strong> or <strong>space</strong> starts the game. <br />
              <br />
              <strong>Stop</strong> or <strong>esc</strong> stops the game.
            </p>
          </div>
        )}
      </div>

      {/* --------------- START / STOP BUTTON (Fade) --------------- */}
      <div className="fade" style={{ marginTop: "20px" }}>
        {isGameRunning ? (
          <button onClick={stopGame}>Stop</button>
        ) : (
          <button onClick={startGame}>Start</button>
        )}
      </div>

      {/* --------------- INSTRUCTIONS --------------- */}
      <div className="instructions-container" style={{ marginTop: "20px", fontSize: "0.9rem" }}>
        {/* Tone match instruction: clickable */}
        <p
          className={`gray-text clickable-instruction ${toneClicked ? "clicked" : ""}`}
          onClick={guessSound}
        >
          For a tone match
          <br />
          Press <strong>e</strong>
        </p>

        {/* Tile match instruction: clickable */}
        <p
          className={`gray-text clickable-instruction ${tileClicked ? "clicked" : ""}`}
          onClick={guessTile}
        >
          For a tile match
          <br />
          Press <strong>p</strong>
        </p>
      </div>
    </div>
  );
}

export default App;
