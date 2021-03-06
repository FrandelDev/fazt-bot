// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { deleteMessage, sendMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as YouTube from '../../utils/music';
import ListSongEmbed, { InvalidPageNumberError } from '../../embeds/listSongsEmbed';

export default class ListCommand implements Command {
  names: Array<string> = ['list', 'queue', 'lista'];
  arguments = '(página)';
  group: CommandGroup = 'music';
  description = 'Mira la lista de reproducción actual.';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      if (!message.guild) {
        return;
      }

      const musicChannel = await YouTube.isMusicChannel(message);
      if (!musicChannel[0]) {
        await message.delete();
        await deleteMessage(await sendMessage(message, `solo puedes usar comandos de música en ${musicChannel[1]}`, alias));
        return;
      }

      const queue = YouTube.queues[message.guild.id];
      if (!queue) {
        await sendMessage(message, 'no estoy reproduciendo música.', alias);
        return;
      }

      if (!queue.songs.length) {
        await sendMessage(message, 'no hay canciones en la lista de reproducción.', alias);
        return;
      }

      const page = Number(params[0] || 1);

      await message.channel.send(new ListSongEmbed(bot, queue, page));
    } catch (error) {
      if (error instanceof InvalidPageNumberError) {
        await sendMessage(message, 'la página no es válida', alias);
      } else {
        console.error('Queue Command', error);
      }
    }
  }
}
