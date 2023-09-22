import { useEffect, useRef, useState } from "react";
import Car from "./images/car.png";
import FinishLine from "./images/finishLine.png";

function PlayerRace(props) {
  const raceDivRef = useRef(null);
  const raceCarRef = useRef(null);
  const[playerPrompt, setPlayerPrompt] = useState("Still, there are times I am bewildered by each mile I have traveled, each meal I have eaten, each person I have known, each room in which I have slept. As ordinary as it all appears, there are times when it is beyond my imagination.");
  //const[playerPrompt, setPlayerPrompt] = useState("Still, there are times I am bewildered");
  const[promptPosition, setPromptPosition] = useState(0);
  const[playerInput, setPlayerInput] = useState("");

  useEffect(() => {
    let playerProgress = promptPosition / playerPrompt.length;
    let carLeft = (raceDivRef.current.offsetWidth - 280) * playerProgress;
    raceCarRef.current.style.left = carLeft + "px";
    if(promptPosition == playerPrompt.length){
      props.playerDone(calcWpm());
    }
    else if(props.isConnected){
      props.reportPlayerProgress(playerProgress, calcWpm());
    }
  }, [promptPosition]);

  const renderPlayerPrompt = () => {
    let greenText = "";
    let redText = "";
    if(promptPosition > 0){
      greenText = playerPrompt.slice(0, promptPosition);
    }
    if(playerInput.length){
      let slice = playerPrompt.slice(promptPosition, promptPosition + playerInput.length);
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

    let p = <p className="playerPrompt"><span className="greenText">{greenText}</span><span className="redText">{redText}</span>{playerPrompt.slice(promptPosition + playerInput.length)}</p>
    return p;
  }

  const playerInputChange = (e) => {
    if(props.timer < 0){
      return;
    }
    let value = e.target.value;
    if(value.charAt(value.length - 1) == " " || promptPosition + value.length == playerPrompt.length){
      if(value == playerPrompt.slice(promptPosition, promptPosition + value.length)){
        setPromptPosition((prev) => prev + value.length);
        setPlayerInput("");
        return;
      }
    }
    setPlayerInput(value);
  }

  const calcWpm = () => {
    if(props.timer <= 0){
      return 0;
    }
    let wordsTyped = playerPrompt.slice(0, promptPosition).split(" ").length;
    let minutesElapsed = props.timer / 60;
    let wordsPerMinute = Math.floor(wordsTyped / minutesElapsed);
    return Math.max(wordsPerMinute, 0);
  }

  return (
    <div className="playerArea">
      <div className="race" ref={raceDivRef}>
        <img className="car" src={Car} alt="" ref={raceCarRef}></img>
        <img className="finishLine" src={FinishLine} alt=""></img>
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
