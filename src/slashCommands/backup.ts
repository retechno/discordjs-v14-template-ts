import {
  SlashCommandBuilder, 
  EmbedBuilder,
} from "discord.js";
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";
import { runBackup } from "../scheduler/dbBackup";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("dbbackup")
    .setDescription("Backup Database")
    .addStringOption((option) =>
      option
        .setName("hostname")
        .setDescription("Database host")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("port")
        .setDescription("Database port")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("Database username")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("password")
        .setDescription("Database password")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("dbname")
        .setDescription("Database name yang akan di-backup (kosongkan untuk backup semua)")
        .setRequired(false)
    ),

  execute: (interaction) => {
    const hostname = interaction.options.getString("hostname", true);
    const port = interaction.options.getInteger("port", true);
    const user = interaction.options.getString("user", true);
    const pass = interaction.options.getString("password", true);
    const dbname = interaction.options.getString("dbname") ?? undefined;

    runBackup(interaction.client, hostname, port.toString(), user, pass, dbname);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: "Cakrasoft Server" })
          .setDescription(`Backup Database ${dbname||'All'} running`)
          .setColor(getThemeColor("text")),
      ],
    });
  },

  cooldown: 10,
};

export default command;
