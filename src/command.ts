import { Message } from 'discord.js';
import { addTime, Player, players, setPlayers } from './player';

const color = 0x7dfcf0;

export const add = async (message: Message) => {
  const discordId = message.content.split(' ')[1] ?? '';
  if (!/^[0-9]+$/.test(discordId)) {
    await message.reply('IDなんだそれぇ');
    return;
  }
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
  };
  setPlayers([...players, player]);
  const title = `${name}が参加しました～`;
  await message.channel.send({ embeds: [{ title, color }] });
};

export const remove = async (message?: Message) => {
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

export const show = async (message: Message) => {
  const fields = players.map((player, index) => {
    const name = `${index + 1}: ${player.name}`;
    const value = '';
    return { name, value };
  });
  const title = '参加者一覧';
  await message.channel.send({ embeds: [{ title, fields, color }] });
};

export const time = async (message: Message) => {
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
