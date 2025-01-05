export interface Position {
  row: number;
  col: number;
}

export const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
export const GRID_SIZE = 3;
export const INITIAL_N = 1;

/**
 * Speaks the letter out loud instead of playing a tone.
 */
export function playLetter(letter: string): void {
  const utter = new SpeechSynthesisUtterance(letter);
  // Optional: Adjust pitch, rate, voice, etc.
  // utter.pitch = 1.0;
  // utter.rate = 1.0;
  // utter.voice = speechSynthesis.getVoices()[0]; // Example of picking a specific voice

  speechSynthesis.speak(utter);
}

/**
 * Makes a random sequence of letters and positions.
 * @param steps - Number of steps (rounds) in the game.
 */
export function generateSequence(steps: number): {
  positions: Position[];
  letters: string[];
} {
  const positions: Position[] = [];
  const letters: string[] = [];

  for (let i = 0; i < steps; i++) {
    positions.push({
      row: Math.floor(Math.random() * GRID_SIZE),
      col: Math.floor(Math.random() * GRID_SIZE),
    });
    letters.push(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
  }
  return { positions, letters };
}

/**
 * Checks whether there's a match in tile (visual) or letter (audio) N steps back.
 * @param currentRound - index of the current step
 * @param posArr - array of tile positions
 * @param letArr - array of letters
 * @param NVal - the N-back value
 */
export function checkMatch(
  currentRound: number,
  posArr: Position[],
  letArr: string[],
  NVal: number
): [boolean, boolean] {
  if (currentRound < NVal) {
    // Not enough history yet to compare
    return [false, false];
  }

  const visualMatch =
    posArr[currentRound].row === posArr[currentRound - NVal].row &&
    posArr[currentRound].col === posArr[currentRound - NVal].col;

  const audioMatch = letArr[currentRound] === letArr[currentRound - NVal];

  return [visualMatch, audioMatch];
}
