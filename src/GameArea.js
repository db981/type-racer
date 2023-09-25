import { useEffect, useRef, useState } from "react";
import PlayerRace from "./PlayerRace";
import OpponentRace from "./OpponentRace";
import { socket } from "./socket";
import Gold from "./images/gold.png";
import Silver from "./images/silver.png";
import Bronze from "./images/bronze.png";

let defaultPrompts = ["I know now that it's over. I knew it then. There would be no way, Michael, no way you could ever forgive me, not with this Sicilian thing that's been going on for 2,000 years.", "Still, there are times I am bewildered by each mile I have traveled, each meal I have eaten, each person I have known, each room in which I have slept. As ordinary as it all appears, there are times when it is beyond my imagination."];
const getRandomPrompt = () => {
  return defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
}

function GameArea() {
  const [timer, setTimer] = useState(null); //time to/since race start time
  const [runTimer, setRunTimer] = useState(false); //if timer should be running
  const [raceStartTime, setRaceStartTime] = useState(null); 
  const [gamePrompt, setGamePrompt] = useState("");

  const [serverReachable, setServerReachable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineGameId, setOnlineGameId] = useState(null);
  const [onlinePlayerId, setOnlinePlayerId] = useState(null);
  const [onlineParticipants, setOnlineParticipants] = useState(null);
  const [onlineGameResult, setOnlineGameResult] = useState(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() { //on disconnect reset to initial state
      setTimer(null);
      setRunTimer(false);
      setRaceStartTime(null);
      setIsConnected(false);
      setOnlineGameId(null);
      setOnlinePlayerId(null);
      setOnlineParticipants(null);
      setOnlineGameResult(null);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', (err) => {
      checkServerReachable();
    });
    socket.on('schedule_online_game', (gameInfo) => { //online game scheduled by server
      setOnlineGameId(gameInfo.gameId);
      setOnlinePlayerId(gameInfo.id);
      setOnlineParticipants(gameInfo.participants);
      scheduleRace(gameInfo.gameStartTime, gameInfo.prompt);
    });
    socket.on('report_participant_progress', (participants) => { //received when online game opponent has made progress
      setOnlineParticipants(participants);
    });
    socket.on('report_player_result', (position) => { //received when local player has finished
      let result;
      if(position == 1){
        result = <img className="medal" src={Gold} alt=""></img>
      }
      else if(position == 2){
        result = <img className="medal" src={Silver} alt=""></img>
      }
      else if(position == 3){
        result = <img className="medal" src={Bronze} alt=""></img>
      }
      else{
        result = position;
      }
      setOnlineGameResult(result);
    });

    checkServerReachable();
    let checkServerReachableInterval = setInterval(checkServerReachable, 10000);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error');
      socket.off('schedule_online_game');
      socket.off('report_opponent_progress');
      socket.off('report_player_result');
      clearInterval(checkServerReachableInterval);
    };
  }, []);

  useEffect(() => {
    let timerInterval;
    if(raceStartTime && runTimer){ //timer for race
      setTimer(Math.floor(getTimeDifferenceSeconds()));
      timerInterval = setInterval(() => {
        setTimer(Math.floor(getTimeDifferenceSeconds()));
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [raceStartTime, runTimer]);

  const getTimeDifferenceSeconds = () => { //time to/since race start time
    return (Date.now() - raceStartTime) / 1000;
  }

  const scheduleRace = (startTime, prompt) => {
    setGamePrompt(prompt);
    setRaceStartTime(startTime);
    setRunTimer(true);
  }

  const playPractice = () => { //local race
    socket.disconnect();
    let startDelaySeconds = 5;
    scheduleRace(Date.now() + startDelaySeconds * 1000, getRandomPrompt());
  }

  const playOnline = () => {
    if(isConnected && !onlineGameResult){ //already in queue or playing online
      return;
    }
    socket.disconnect();
    socket.connect();
  }

  const reportPlayerProgress = (playerProgress, wordsTyped) => { //tell server local player has made progress
    socket.emit('report_player_progress', {gameId: onlineGameId, playerProgress, wordsTyped});
  }

  const playerDone = (wpm) => { //tell server local player has finished
    setRunTimer(false);
    if(isConnected){
      socket.emit('player_finished', {gameId: onlineGameId, finishedTime: Date.now(), wpm});
    }
    else{
      setRunTimer(false);
    }
  }

  const renderOnlineParticipants = () => {
    let opponentRaces = [];
    for(const id in onlineParticipants){
      if(id == onlinePlayerId){
        continue;
      }
      opponentRaces.push(<OpponentRace key={id} progress={onlineParticipants[id].progress} wordsTyped={onlineParticipants[id].wordsTyped} gamePrompt={gamePrompt} timer={timer}></OpponentRace>);
    } 
    return opponentRaces;
  }

  const checkServerReachable = async () => {
    try{
      setServerReachable((await fetch("http://localhost:4000/api/checkOnline")).status == 200);
    }
    catch(err){
      setServerReachable(false);
      socket.disconnect();
    }
  }

  return (
    <div className="gameArea">
      <div className="gameTimer">{onlineGameResult ? onlineGameResult : timer == null ? null : timer == 0 ? "GO!" : Math.abs(timer)}</div>
      {renderOnlineParticipants()}
      <PlayerRace gamePrompt={gamePrompt}timer={timer} runTimer={runTimer} raceStartTime={raceStartTime} playerDone={playerDone} isConnected={isConnected} reportPlayerProgress={reportPlayerProgress}></PlayerRace>
      <div className="gameControls">
        <button onClick={playPractice}>Practice</button>
        {serverReachable ? <button onClick={playOnline}>{!isConnected ? "Play online" : !onlineGameId ? "In queue..." : onlineGameResult ? "Play online again" : "Playing online"}</button> :
                            <button disabled>Server Offline</button>}
      </div>
    </div>
  )
}

export default GameArea;
