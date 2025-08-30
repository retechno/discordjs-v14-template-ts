import { Client, TextChannel } from "discord.js";
import { BotEvent } from "../types";
import { color } from "../functions";
import serverCheck from "../scheduler/serverHealth";
import { scheduleDailyBackup } from "../scheduler/dbBackup";
import { scheduleDailyLogCleaner } from "../scheduler/dockerLogCleaner";

const serverChannelId = "1095904872974520320";
let serviceStatus = {
  api: false,
  api1: false,
  api2: false,
  apiCM: false,
  web: false,
};

const event: BotEvent = {
  name: "ready",
  once: true,
  execute: (client: Client) => {
    console.log(
      color("text", `💪 Logged in as ${color("variable", client.user?.tag)}`)
    );

    const channel: TextChannel = client.channels.cache.get(
      serverChannelId
    ) as TextChannel;
    if (channel) {
      channel.send(`\\✅ Server check is running`);
    } else {
      console.error("Unable to find the specified channel.");
    }
    console.log("Server check running");

    setInterval(() => {
      serverCheck(client, serviceStatus);
    }, 60000);

    if (channel) {
      channel.send(`\\✅ Backup scheduler is running`);
    } else {
      console.error("Unable to find the specified channel.");
    }
    console.log("Backup scheduler is running");
    scheduleDailyBackup(client);
    
    if (channel) {
      channel.send(`\\✅ Log Cleaner scheduler is running`);
    } else {
      console.error("Unable to find the specified channel.");
    }
    console.log("Log Cleaner scheduler is running");
    scheduleDailyLogCleaner(channel)
  },
};

export default event;
