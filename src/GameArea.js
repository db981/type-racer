import { useEffect, useRef, useState } from "react";
import PlayerRace from "./PlayerRace";

function GameArea() {
  const timerRef = useRef(3);
  let timerIntervalRef = useRef(null);
  const [gameStartTime, setGameStartTime] = useState(null);

  const startGame = () => {
    let startDelaySeconds = 3;
    let incrementor = -1;
    let time = startDelaySeconds;
    setGameStartTime(Date.now() + startDelaySeconds * 1000);
    timerIntervalRef.current = setInterval(() => {
      time += incrementor
      let timerText;
      if(time == 0){
        timerText = "GO!";
        incrementor = 1;
      }
      else{
        timerText = time;
      }
      timerRef.current.innerText = timerText;
    }, 1000);
  }

  const racerDone = (isPlayer) => {
    setGameStartTime(null);
    clearInterval(timerIntervalRef.current);
  }

  return (
    <div className="gameArea">
      <div className="gameTimer" ref={timerRef}>3</div>
      <PlayerRace gameStartTime={gameStartTime} racerDone={racerDone}></PlayerRace>
      <button onClick={startGame}>Start</button>
    </div>
  )
}

export default GameArea;
