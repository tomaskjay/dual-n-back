export interface Position {
  row: number;
  col: number;
}

export const LETTERS = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India"];
export const GRID_SIZE = 3;
export const INITIAL_N = 2;

/**
 * Speaks the letter out loud instead of playing a tone.
 */
export function playLetter(letter: string): void {
  const utter = new SpeechSynthesisUtterance(letter);
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
