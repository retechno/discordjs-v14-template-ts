import {
  SlashCommandBuilder,
  ChannelType,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";
import { runBackup } from "../scheduler/dbBackup";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("dbbackup")
    .setDescription("Backup Database"),
  execute: (interaction) => {
    runBackup(interaction.client);
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: "Cakrasoft Server" })
          .setDescription(`Backup Database running`)
          .setColor(getThemeColor("text")),
      ],
    });
  },
  cooldown: 10,
};

export default command;
