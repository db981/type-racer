import { useEffect, useRef, useState } from "react";
import Car from "./images/car.png"

function PlayerRace() {
  const raceDivRef = useRef(null);
  const[playerPrompt, setPlayerPrompt] = useState("Still, there are times I am bewildered by each mile I have traveled, each meal I have eaten, each person I have known, each room in which I have slept. As ordinary as it all appears, there are times when it is beyond my imagination.");
  const[promptPosition, setPromptPosition] = useState(0);
  const[playerInput, setPlayerInput] = useState("");

  useEffect(() => {
    console.log(promptPosition, playerPrompt.length);
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
          console.log(slice.charAt(i), playerInput.charAt(i));
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

  return (
    <div className="playerArea">
      <div className="race" ref={raceDivRef}>
        <img className="car" src={Car} alt=""></img>
      </div>
      {renderPlayerPrompt()}
      <input className="playerInput" placeholder="Type here..." value={playerInput} onInput={playerInputChange}></input>
    </div>

  )
}

export default PlayerRace;
