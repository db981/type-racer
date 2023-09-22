import { useRef, useEffect } from "react";
import Car from "./images/car.png";
import FinishLine from "./images/finishLine.png";

function OpponentRace(props){
  const raceDivRef = useRef(null);
  const raceCarRef = useRef(null);

  useEffect(() => {
    let carLeft = (raceDivRef.current.offsetWidth - 280) * props.progress;
    raceCarRef.current.style.left = carLeft + "px";
  }, [props.progress]);

  return(
    <div className="race" ref={raceDivRef}>
        <img className="car" src={Car} alt="" ref={raceCarRef}></img>
        <img className="finishLine" src={FinishLine} alt=""></img>
      </div>
  )
}

export default OpponentRace;
