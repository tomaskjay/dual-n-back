export interface Game {
    sequence: number[];
  }
  
  export function generateSequence(gridSize: number, sequenceLength: number): number[] {
    return Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * gridSize * gridSize));
  }