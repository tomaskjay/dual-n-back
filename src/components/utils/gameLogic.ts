export interface Position {
  row: number;
  col: number;
}

export const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
export const GRID_SIZE = 3;
export const INITIAL_N = 1;

//Makes a random frequency based on the letter
//"A" has the lowest frequency, "I" the highest.
export function getLetterFrequency(letter: string): number {
  const baseFreq = 400;
  const step = 50; 
  const index = LETTERS.indexOf(letter);
  return baseFreq + index * step;
}

// Plays letter sound
export function playLetter(letter: string): void {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContext();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.frequency.value = getLetterFrequency(letter);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Setting volume
  gainNode.gain.value = 0.3;

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
    audioCtx.close();
  }, 500);
}

/**
 * Makes a random sequence of letters and positions
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
 * @param posArr - positions array
 * @param letArr - letters array
 * @param NVal - n-back value
 */
export function checkMatch(
  currentRound: number,
  posArr: Position[],
  letArr: string[],
  NVal: number
): [boolean, boolean] {
  if (currentRound < NVal) {
    return [false, false]; // Makes sure that we don't check for matches before N rounds
  }
  const visualMatch =
    posArr[currentRound].row === posArr[currentRound - NVal].row &&
    posArr[currentRound].col === posArr[currentRound - NVal].col;
  const audioMatch = letArr[currentRound] === letArr[currentRound - NVal];
  return [visualMatch, audioMatch];
}
