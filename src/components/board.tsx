import React from "react";
import './board.css';

export default function Board() {
  const gridSize = 3;
  const cells = Array.from({ length: gridSize * gridSize }, (_, index) => (
    <div key={index} className="cell"></div>
  ));

  return (
    <div className="board">
      {cells}
    </div>
  );
}