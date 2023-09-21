import { useState } from "react";
import Car from "./images/car.png"

function PlayerRace() {
  const[playerPrompt, setPlayerPrompt] = useState();
  const[playerInput, setUserInput] = useState();

  return (
    <div className="playerArea">
      <div className="race">
        <img className="car" src={Car}></img>
      </div>
      <p className="playerPrompt">Still, there are times I am bewildered by each mile I have traveled, each meal I have eaten, each person I have known, each room in which I have slept. As ordinary as it all appears, there are times when it is beyond my imagination.</p>
      <input className="playerInput" placeholder="Type here..." value={playerInput}></input>
    </div>

  )
}

export default PlayerRace;
