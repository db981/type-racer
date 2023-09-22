import { useEffect, useRef, useState } from "react";
import PlayerRace from "./PlayerRace";
import OpponentRace from "./OpponentRace";
import { socket } from "./socket";

function GameArea() {
  const [timer, setTimer] = useState(null);
  const [runTimer, setRunTimer] = useState(false);
  const [raceStartTime, setRaceStartTime] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineGameId, setOnlineGameId] = useState(null);
  const [opponents, setOpponents] = useState(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("connected");
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', (err) => {
      console.log(err);
    });
    socket.on('schedule_online_game', (gameInfo) => {
      setOnlineGameId(gameInfo.gameId);
      scheduleRace(gameInfo.gameStartTime);
    });
    socket.on('report_opponent_progress', (participants) => {
      console.log(participants);
      setOpponents(participants);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error');
      socket.off('schedule_game_start');
      socket.off('report_opponent_progress');
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
    if(runTimer || isConnected){
      return;
    }
    let startDelaySeconds = 5;
    scheduleRace(Date.now() + startDelaySeconds * 1000)
  }

  const playOnline = () => {
    if(runTimer || isConnected){
      return;
    }
    socket.connect();
  }

  const reportPlayerProgress = (playerProgress, wpm) => {
    socket.emit('report_player_progress', {gameId: onlineGameId, playerProgress, wpm});
  }

  const playerDone = (wpm) => {
    setRunTimer(false);
    if(isConnected){
      socket.emit('player_finished', {gameId: onlineGameId, finishedTime: Date.now(), wpm});
    }
  }

  return (
    <div className="gameArea">
      <div className="gameTimer">{timer == null ? null : timer == 0 ? "GO!" : Math.abs(timer)}</div>
      <OpponentRace progress={0.5}></OpponentRace>
      <PlayerRace timer={timer} runTimer={runTimer} playerDone={playerDone} isConnected={isConnected} reportPlayerProgress={reportPlayerProgress}></PlayerRace>
      <div className="gameControls">
        <button onClick={playPractice}>Practice</button>
        <button onClick={playOnline}>{!isConnected ? "Play online" : !onlineGameId ? "In queue..." : "Playing online"}</button>
      </div>
    </div>
  )
}

export default GameArea;
