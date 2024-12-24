import React from "react";
import './board.css';
import { Position } from "./utils/gameLogic";

interface BoardProps {
    highlighted: Position | null; // Current position to highlight
}

const GRID_SIZE = 3;

const Board: React.FC<BoardProps> = ({ highlighted }) => {
    const verticalAxis = ["1", "2", "3"];
    const horizontalAxis = ["a", "b", "c"];

    const board = [];

    for(let j = verticalAxis.length - 1; j >= 0; j--) {
        for(let i = 0; i < horizontalAxis.length; i++) {
            const currentPosition = { row: j, col: i };
            const isActive = highlighted && 
                             highlighted.row === currentPosition.row && 
                             highlighted.col === currentPosition.col;

            board.push(
                <div 
                    key={`${horizontalAxis[i]}${verticalAxis[j]}`} 
                    className={`tile ${isActive ? "active" : ""}`}
                >
                </div>
            );
        }
    }

    return (
        <div className="board">
            {board}
        </div>
    );
}

export default Board;
