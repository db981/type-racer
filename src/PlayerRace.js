import { useEffect, useRef, useState } from "react";
import Car from "./images/car.png";
import FinishLine from "./images/finishLine.png";

function PlayerRace(props) {
  const raceDivRef = useRef(null);
  const raceCarRef = useRef(null);
  const [promptPosition, setPromptPosition] = useState(0);
  const [playerInput, setPlayerInput] = useState("");
  const [wpm, setWpm] = useState(0);

  useEffect(() => {
    let playerProgress = promptPosition / props.gamePrompt.length; //calculate position for car img
    let carLeft = (raceDivRef.current.offsetWidth - 280) * playerProgress;
    raceCarRef.current.style.left = carLeft + "px";
    if (props.isConnected) {
      props.reportPlayerProgress(playerProgress, getWordsTyped());
    }

    if (promptPosition == props.gamePrompt.length) {
      props.playerDone(calcWpm());
    }
  }, [promptPosition]);

  useEffect(() => {
    setPromptPosition(0);
    setPlayerInput("");
  }, [props.raceStartTime])

  useEffect(() => {
    if (promptPosition < props.gamePrompt.length) {
      setWpm(calcWpm());
    }
  }, [props.timer, promptPosition, props.raceStartTime])

  const getWordsTyped = () => {
    let slice = props.gamePrompt.slice(0, promptPosition).split(" ");
    if (slice.length == 1 && slice[0] == "") {
      return 0;
    }
    else {
      return slice.length;
    }
  }

  const calcWpm = () => { //wpm = words per minute
    let wordsTyped = getWordsTyped();
    if (props.timer <= 0 || wordsTyped == 0) {
      return 0;
    }
    let minutesElapsed = props.timer / 60;
    let wordsPerMinute = Math.floor(wordsTyped / minutesElapsed);
    if (isNaN(wordsPerMinute) || wordsPerMinute < 0) {
      wordsPerMinute = 0;
    }
    return wordsPerMinute;
  }

  const playerInputChange = (e) => {
    if (props.timer == null || props.timer < 0 || e.nativeEvent.inputType == 'insertFromPaste') { //ignore if no race or race hasnt started or user pasted text
      return;
    }

    let value = e.target.value;
    if (value.charAt(value.length - 1) == " " || promptPosition + value.length == props.gamePrompt.length) { //if end of word or prompt
      if (value == props.gamePrompt.slice(promptPosition, promptPosition + value.length)) { //(and) if no user input errors
        setPromptPosition((prev) => prev + value.length);
        setPlayerInput("");
        return;
      }
    }
    setPlayerInput(value);
  }

  const renderPlayerPrompt = () => {
    let greenText = ""; //show green text for correct user input 
    let redText = ""; //show red text for incorrect user input
    if (promptPosition > 0) {
      greenText = props.gamePrompt.slice(0, promptPosition);
    }
    if (playerInput.length) {
      let slice = props.gamePrompt.slice(promptPosition, promptPosition + playerInput.length);
      for (let i = 0; i < slice.length; i++) {
        if (slice.charAt(i) == playerInput.charAt(i)) { //go character by character checking for error
          greenText += playerInput.charAt(i);
        }
        else { //if error, rest of input is also error
          redText += slice.slice(i);
          break;
        }
      }
    }

    return <p className="playerPrompt"><span className="greenText">{greenText}</span><span className="redText">{redText}</span>{props.gamePrompt.slice(promptPosition + playerInput.length)}</p>;
  }

  return (
    <div className="playerArea">
      <div className="race" ref={raceDivRef}>
        <img className="car" src={Car} alt="" ref={raceCarRef}></img>
        <img className="finishLine" src={FinishLine} alt=""></img>
        <h4 className="raceWpm">{wpm} WPM</h4>
      </div>
      <div className="promptContainer">
        <div className="playerStats"><h5>{wpm} WPM</h5></div>
        {renderPlayerPrompt()}
      </div>
      <input className="playerInput" placeholder="Type here..." value={playerInput} onInput={playerInputChange}></input>
    </div>
  )
}

export default PlayerRace;
