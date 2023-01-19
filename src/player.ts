import { writeFileSync, readFileSync } from 'fs';

export type Time = {
  minute: number;
  second: number;
  millisecond: number;
  value: number;
};

export type Player = {
  discordId: string;
  name: string;
  recordTimes: Time[][];
  times: Time[];
  points: number[];
};

const POINTS = [[1], [3, 1], [3, 1, 0], [4, 2, 1, 0], [6, 4, 2, 1, 0]];
const REPEAT = 2;

export let players: Player[] = [];
let playerIndex = 0;
export let orderFlag = false;
loadJSON();

const saveJSON = () => {
  const data = { playerIndex, orderFlag, players };
  const json = JSON.stringify(data, null, '\t');
  writeFileSync('./players.json', json);
};

function loadJSON() {
  try {
    const jsonText = readFileSync('./players.json', 'utf-8');
    const data = JSON.parse(jsonText);
    players = data.players;
    playerIndex = data.playerIndex;
    orderFlag = data.orderFlag;
  } catch {
    console.log('プレイやーいない模様');
  }
}

export const forceOrder = () => orderFlag;

export const setPlayers = (newPlayers: Player[]) => {
  players = newPlayers;
  saveJSON();
};

const selectFastestTime = (playerIndex: number) => {
  const { recordTimes } = players[playerIndex];
  const currentTimes = recordTimes[recordTimes.length - 1];
  if (!currentTimes || currentTimes.length < REPEAT) {
    return null;
  }
  return currentTimes.reduce((pre, cur) => {
    return pre.value < cur.value ? pre : cur;
  }, currentTimes[0]);
};

export const addTime = (time: Time) => {
  const { recordTimes } = players[playerIndex];
  const currentTimes = recordTimes[recordTimes.length - 1];
  if (!currentTimes || currentTimes.length >= REPEAT) {
    players[playerIndex].recordTimes = [...recordTimes, []];
  }
  const newRecordTimes = players[playerIndex].recordTimes;
  newRecordTimes[newRecordTimes.length - 1] = [
    ...(newRecordTimes[newRecordTimes.length - 1] ?? []),
    time,
  ];
  const fastestTime = selectFastestTime(playerIndex);
  if (fastestTime !== null) {
    players[playerIndex].times = [...players[playerIndex].times, fastestTime];
  }
  const player = players[playerIndex];
  playerIndex += 1;
  const isLast = playerIndex >= players.length;
  if (isLast) {
    playerIndex = 0;
  }
  let next: Player | null = players[playerIndex];
  if (
    isLast &&
    player.recordTimes[player.recordTimes.length - 1].length === REPEAT
  ) {
    assignPoints();
    orderFlag = true;
    next = null;
  }
  saveJSON();
  return { player, next };
};

const assignPoints = () => {
  const timeLength = players[0].times.length;
  if (players.some((player) => player.times.length !== timeLength)) {
    return;
  }
  const tmpPlayers = [...players];
  const points = POINTS[players.length - 1];
  players.forEach((p) => {
    p.points = [];
  });
  [...Array(timeLength).keys()].forEach((index) => {
    tmpPlayers.sort((a, b) => {
      const aTime = a.times[index];
      const bTime = b.times[index];
      return aTime.value - bTime.value;
    });
    tmpPlayers.forEach((player, index) => {
      player.points = [...player.points, points[index]];
    });
  });
};

export const orderPlayers = (ids: string[]) => {
  let playerList = [...players];
  let newPlayers = [] as Player[];
  ids.forEach((id) => {
    const player = playerList.find((p) => p.discordId === id);
    if (player) {
      newPlayers = [...newPlayers, player];
      playerList = playerList.filter((p) => p.discordId !== id);
    }
  });
  newPlayers = [...newPlayers, ...playerList];
  players = newPlayers;
  orderFlag = false;
  saveJSON();
};
