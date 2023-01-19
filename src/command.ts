import { Message } from 'discord.js';
import {
  addTime,
  assignPoints,
  forceOrder,
  getPlayers,
  orderPlayers,
  Player,
  setPlayers,
  timeText,
} from './player';

const color = 0x7dfcf0;

export const add = async (message: Message) => {
  const discordId = message.content.split(' ')[1] ?? '';
  if (!/^[0-9]+$/.test(discordId)) {
    await message.reply('IDなんだそれぇ');
    return;
  }
  const players = getPlayers();
  if (players.some((player) => player.discordId === discordId)) {
    await message.reply('もういるよ');
    return;
  }
  const member = await message.guild?.members.fetch(discordId);
  if (member === undefined) {
    await message.reply('そんな人いないよ');
    return;
  }
  const name = member.displayName;
  const player: Player = {
    discordId,
    name,
    recordTimes: [],
    times: [],
    points: [],
    totalPoint: 0,
  };
  setPlayers([...players, player]);
  const title = `${name}が参加しました～`;
  await message.channel.send({ embeds: [{ title, color }] });
};

export const remove = async (message?: Message) => {
  const players = getPlayers();
  if (message === undefined) {
    setPlayers(players.slice(0, -1));
    return;
  }
  const removeIndexText = message.content.split(' ')[1] ?? '0';
  const removeIndex = Number.parseInt(removeIndexText, 10);
  setPlayers([
    ...players.slice(0, removeIndex),
    ...players.slice(removeIndex + 1),
  ]);
};

export const member = async (message: Message) => {
  const players = getPlayers();
  const fields = players.map((player, index) => {
    const name = `${index + 1}: ${player.name}`;
    const value = '';
    return { name, value };
  });
  const title = '参加者一覧';
  await message.channel.send({ embeds: [{ title, fields, color }] });
};

export const time = async (message: Message) => {
  if (forceOrder()) {
    await message.reply('ひとまず並び替えようか');
    return;
  }
  const timeText = message.content.split(' ')[1] ?? '';
  if (!/^[0-9]+:[0-9]+:[0-9]+$/.test(timeText)) {
    await message.reply('時間わかんないね');
    return;
  }
  const [minuteText, secondText, millisecondText] = timeText.split(':');
  const minute = Number.parseInt(minuteText, 10);
  const second = Number.parseInt(secondText, 10);
  const millisecondWithZero = (millisecondText + '000').slice(0, 3);
  const millisecond = Number.parseInt(millisecondWithZero, 10);
  const value = minute * 60 * 1000 + second * 1000 + millisecond;
  const time = { minute, second, millisecond, value };
  const { player, next } = addTime(time);
  const { name, recordTimes } = player;
  const raceCount = recordTimes.length;
  const repeatCount = recordTimes[raceCount - 1].length;
  const title = `${name}の${raceCount}レース目${repeatCount}回目`;
  const nextName = next !== null ? `\n次の人: ${next.name}` : '';
  const description = `${minuteText}:${secondText}:${millisecondWithZero}${nextName}`;
  await message.reply({ embeds: [{ title, description, color }] });
};

export const order = async (message: Message) => {
  const orderText = message.content.split(' ').slice(1).join(' ');
  if (!/^([0-9]+[\s]*)+$/.test(orderText)) {
    await message.reply('順番わかんないね');
    return;
  }
  const ids = orderText.split(' ');
  orderPlayers(ids);
  const players = getPlayers();
  const fields = players.map((player, index) => {
    const name = `${index + 1}: ${player.name}`;
    const value = '';
    return { name, value };
  });
  const title = '並び替えたよ';
  const description = '次行こうや';
  await message.channel.send({
    embeds: [{ title, description, fields, color }],
  });
};

export const showResult = async (message: Message) => {
  const players = getPlayers().sort((a, b) => b.totalPoint - a.totalPoint);
  let rank = 1;
  const fields = players.map(({ times, points, name, totalPoint }, index) => {
    if (index > 0 && players[index - 1].totalPoint !== totalPoint) {
      rank = index + 1;
    }
    const nameText = `${rank}位: ${name}(${totalPoint}点)`;
    const value = times
      .map((time, j) => {
        const point = points[j];
        return `${j + 1}レース目: ${timeText(time)} (${point}点)`;
      })
      .join('\n');
    return { name: nameText, value };
  });
  const title = 'けっかはっぴょおおお';
  await message.channel.send({ embeds: [{ title, fields, color }] });
};

export const showIndividual = async (message: Message) => {
  const id = message.content.split(' ')[1] ?? '0';
  const player = getPlayers().find((player) => player.discordId === id);
  if (player === undefined) {
    await message.reply('そんな人いないよ');
    return;
  }
  const { times, recordTimes, name, points, totalPoint } = player;
  const title = `${name}くんのタイム`;
  const description = `合計ポイント: ${totalPoint}点`;
  const fields = recordTimes.map((recordTime, index) => {
    const resultTime = times[index];
    const point = points[index];
    const pointText = point !== undefined ? `: ${point}点` : '';
    const resultTimeText =
      resultTime !== undefined ? ` (${timeText(resultTime)}${pointText})` : '';
    const name = `${index + 1}レース目${resultTimeText}`;
    const value = recordTime
      .map((time, j) => `${j + 1}回目: ${timeText(time)}`)
      .join('\n');
    return { name, value };
  });
  await message.channel.send({
    embeds: [{ title, description, fields, color }],
  });
};

export const assign = async (message: Message) => {
  assignPoints();
  await message.reply('ポイント割り振ったよ');
};
