import { PermissionFlagsBits } from "discord.js";
import { Command } from "../types";
import { runBackup } from "../scheduler/dbBackup";

const command: Command = {
  name: "backup",
  aliases: ["backup"],
  permissions: ["Administrator", PermissionFlagsBits.ManageEmojisAndStickers],
  cooldown: 10,

  execute: (message, args) => {
    // args: ["hostname", "3306", "dbuser", "pass123"]

    const hostname = args[0];
    const port = args[1];
    const user = args[2];
    const pass = args[3];
    const dbname = args[4] || "";

    if (!hostname || !port || !user || !pass) {
      message.channel.send(
        `Usage: !backup <hostname> <port> <user> <password> <dbname?>`
      );
      return;
    }

    message.channel.send(`Backup Database ${dbname||'All'} running.`);

    runBackup(
      message.client,
      hostname,
      port,
      user,
      pass,
      dbname
    );
  },
};

export default command;
