import { PermissionFlagsBits } from "discord.js";
import { Command } from "../types";
import { runBackup } from "../scheduler/dbBackup";

const command: Command = {
  name: "backup",
  execute: (message, args) => {
    message.channel.send(`Backup Database running.`);
    runBackup(message.client);
  },
  cooldown: 10,
  aliases: ["backup"],
  permissions: ["Administrator", PermissionFlagsBits.ManageEmojisAndStickers], // to test
};

export default command;
