import { useEffect, useRef, useState } from "react";
import Car from "./images/car.png";
import FinishLine from "./images/finishLine.png";

function PlayerRace(props) {
  const raceDivRef = useRef(null);
  const raceCarRef = useRef(null);
  const[promptPosition, setPromptPosition] = useState(0);
  const[playerInput, setPlayerInput] = useState("");

  useEffect(() => {
    let playerProgress = promptPosition / props.gamePrompt.length;
    let carLeft = (raceDivRef.current.offsetWidth - 280) * playerProgress;
    raceCarRef.current.style.left = carLeft + "px";
    if(props.isConnected){
      props.reportPlayerProgress(playerProgress, getWordsTyped());
    }

    if(promptPosition == props.gamePrompt.length){
      props.playerDone(calcWpm());
    }
  }, [promptPosition]);

  useEffect(() => {
    setPromptPosition(0);
    setPlayerInput("");
  }, [props.raceStartTime])

  const renderPlayerPrompt = () => {
    let greenText = "";
    let redText = "";
    if(promptPosition > 0){
      greenText = props.gamePrompt.slice(0, promptPosition);
    }
    if(playerInput.length){
      let slice = props.gamePrompt.slice(promptPosition, promptPosition + playerInput.length);
      for(let i = 0; i < slice.length; i++){
        if(slice.charAt(i) == playerInput.charAt(i)){
          greenText += playerInput.charAt(i);
        }
        else{
          redText += slice.slice(i);
          break;
        }
      }
    }

    let p = <p className="playerPrompt"><span className="greenText">{greenText}</span><span className="redText">{redText}</span>{props.gamePrompt.slice(promptPosition + playerInput.length)}</p>
    return p;
  }

  const playerInputChange = (e) => {
    if(props.timer == null || props.timer < 0){
      return;
    }
    let value = e.target.value;
    if(value.charAt(value.length - 1) == " " || promptPosition + value.length == props.gamePrompt.length){
      if(value == props.gamePrompt.slice(promptPosition, promptPosition + value.length)){
        setPromptPosition((prev) => prev + value.length);
        setPlayerInput("");
        return;
      }
    }
    setPlayerInput(value);
  }

  const getWordsTyped = () => {
    return props.gamePrompt.slice(0, promptPosition).split(" ").length;
  }

  const calcWpm = () => {
    if(props.timer <= 0){
      return 0;
    }
    let wordsTyped = getWordsTyped();
    let minutesElapsed = props.timer / 60;
    let wordsPerMinute = Math.floor(wordsTyped / minutesElapsed);
    return Math.max(wordsPerMinute, 0);
  }

  return (
    <div className="playerArea">
      <div className="race" ref={raceDivRef}>
        <img className="car" src={Car} alt="" ref={raceCarRef}></img>
        <img className="finishLine" src={FinishLine} alt=""></img>
        <h4 className="raceWpm">{calcWpm()} WPM</h4>
      </div>
      <div className="promptContainer">
        <div className="playerStats"><h5>{calcWpm()} WPM</h5></div>
        {renderPlayerPrompt()}
      </div>
      <input className="playerInput" placeholder="Type here..." value={playerInput} onInput={playerInputChange}></input>
    </div>
  )
}

export default PlayerRace;
