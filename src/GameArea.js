import { useEffect, useRef, useState } from "react";
import PlayerRace from "./PlayerRace";

function GameArea() {
  const [timer, setTimer] = useState(null);
  const [runTimer, setRunTimer] = useState(false);
  const [raceStartTime, setRaceStartTime] = useState(null);

  useEffect(() => {
    let timerInterval;
    if(raceStartTime && runTimer){
      setTimer(getTimeDifferenceSeconds());
      timerInterval = setInterval(() => {
        setTimer(getTimeDifferenceSeconds());
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [raceStartTime, runTimer]);

  const getTimeDifferenceSeconds = () => {
    return Math.round((Date.now() - raceStartTime) / 1000);
  }

  const scheduleRace = () => {
    let startDelaySeconds = 5;
    setRaceStartTime(Date.now() + startDelaySeconds * 1000);
    setRunTimer(true);
  }

  const playerDone = (wpm) => {
    console.log("Your final WPM is " + wpm);
    setRunTimer(false);
  }

  return (
    <div className="gameArea">
      <div className="gameTimer">{timer == null ? null : timer == 0 ? "GO!" : Math.abs(timer)}</div>
      <PlayerRace timer={timer} runTimer={runTimer} playerDone={playerDone}></PlayerRace>
      <button onClick={scheduleRace}>Start</button>
    </div>
  )
}

export default GameArea;
