import {
  SlashCommandBuilder,
  ChannelType,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
const { exec } = require("child_process");
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Shows the bot's ping"),
  execute: (interaction) => {
    const command = "";
    exec(command, (error2: any, stdout2: any, stderr2: any) => {
      if (error2) {
        console.error(`Error executing command: ${error2}`);
        return;
      }
    });

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: "Cakrasoft Server" })
          .setDescription(`🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
          .setColor(getThemeColor("text")),
      ],
    });
  },
  cooldown: 10,
};

export default command;
