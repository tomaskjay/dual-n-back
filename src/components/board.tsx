import React from "react";

import './board.css';

const verticalAxis = ["1", "2", "3"];
const horizontalAxis = ["a", "b", "c"];

export default function Board() {
    let board = [];

    for(let j = verticalAxis.length - 1; j >= 0; j--) {

    for(let i = 0; i < horizontalAxis.length; i++) {
        board.push(
        <div className="tile">[{horizontalAxis[i]}{verticalAxis[j]}]</div>
            );
        }
    }


    return <div id ="board">
        {board}
    </div>;
}