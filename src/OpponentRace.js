import { useRef, useEffect, useState } from "react";
import Car from "./images/car.png";
import FinishLine from "./images/finishLine.png";

function OpponentRace(props){
  const raceDivRef = useRef(null);
  const raceCarRef = useRef(null);
  const [wpm, setWpm] = useState(0);

  useEffect(() => { 
    let carLeft = (raceDivRef.current.offsetWidth - 280) * props.progress; //calculate position for car img
    raceCarRef.current.style.left = carLeft + "px";
    setWpm(calcWpm());
  }, [props.progress]);

  const calcWpm = () => {
    if(props.timer <= 0){
      return 0;
    }
    let minutesElapsed = props.timer / 60;
    let wordsPerMinute = Math.floor(props.wordsTyped / minutesElapsed);
    return Math.max(wordsPerMinute, 0);
  }

  return(
    <div className="race" ref={raceDivRef}>
        <img className="car" src={Car} alt="" ref={raceCarRef}></img>
        <img className="finishLine" src={FinishLine} alt=""></img>
        <h4 className="raceWpm">{wpm} WPM</h4>
      </div>
  )
}

export default OpponentRace;
