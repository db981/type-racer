import { useEffect, useRef, useState } from "react";
import PlayerRace from "./PlayerRace";
import OpponentRace from "./OpponentRace";
import { socket } from "./socket";
import Gold from "./images/gold.png";
import Silver from "./images/silver.png";
import Bronze from "./images/bronze.png";

function GameArea() {
  const [timer, setTimer] = useState(null);
  const [runTimer, setRunTimer] = useState(false);
  const [raceStartTime, setRaceStartTime] = useState(null);
  const [gamePrompt, setGamePrompt] = useState("Still, there are times I am bewildered");

  const [isConnected, setIsConnected] = useState(false);
  const [onlineGameId, setOnlineGameId] = useState(null);
  const [onlinePlayerId, setOnlinePlayerId] = useState(null);
  const [onlineParticipants, setOnlineParticipants] = useState(null);
  const [onlineGameResult, setOnlineGameResult] = useState(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("connected");
    }

    function onDisconnect() {
      setIsConnected(false);
      setOnlineGameId(null);
      setOnlinePlayerId(null);
      setOnlineParticipants(null);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', (err) => {
      console.log(err);
    });
    socket.on('schedule_online_game', (gameInfo) => {
      setOnlineGameId(gameInfo.gameId);
      setOnlinePlayerId(gameInfo.id);
      setOnlineParticipants(gameInfo.participants);
      scheduleRace(gameInfo.gameStartTime);
    });
    socket.on('report_participant_progress', (participants) => {
      setOnlineParticipants(participants);
    });
    socket.on('report_player_result', (position) => {
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
    })

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error');
      socket.off('schedule_game_start');
      socket.off('report_opponent_progress');
      socket.off('report_player_result');
    };
  }, []);

  useEffect(() => {
    let timerInterval;
    if(raceStartTime && runTimer){
      setTimer(Math.floor(getTimeDifferenceSeconds()));
      timerInterval = setInterval(() => {
        setTimer(Math.floor(getTimeDifferenceSeconds()));
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [raceStartTime, runTimer]);

  const getTimeDifferenceSeconds = () => {
    return (Date.now() - raceStartTime) / 1000;
  }

  const scheduleRace = (startTime) => {
    setRaceStartTime(startTime);
    setRunTimer(true);
  }

  const playPractice = () => {
    socket.disconnect();
    let startDelaySeconds = 5;
    scheduleRace(Date.now() + startDelaySeconds * 1000)
  }

  const playOnline = () => {
    if(isConnected){ //already in queue or playing online
      return;
    }
    socket.disconnect();
    socket.connect();
  }

  const reportPlayerProgress = (playerProgress, wordsTyped) => {
    socket.emit('report_player_progress', {gameId: onlineGameId, playerProgress, wordsTyped});
  }

  const playerDone = (wpm) => {
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

  return (
    <div className="gameArea">
      <div className="gameTimer">{onlineGameResult ? onlineGameResult : timer == null ? null : timer == 0 ? "GO!" : Math.abs(timer)}</div>
      {renderOnlineParticipants()}
      <PlayerRace gamePrompt={gamePrompt}timer={timer} runTimer={runTimer} raceStartTime={raceStartTime} playerDone={playerDone} isConnected={isConnected} reportPlayerProgress={reportPlayerProgress}></PlayerRace>
      <div className="gameControls">
        <button onClick={playPractice}>Practice</button>
        <button onClick={playOnline}>{!isConnected ? "Play online" : !onlineGameId ? "In queue..." : "Playing online"}</button>
      </div>
    </div>
  )
}

export default GameArea;
