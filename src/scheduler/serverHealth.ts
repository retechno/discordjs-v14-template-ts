import axios from "axios";
import { Client, TextChannel } from "discord.js";
const apiChannelId = "1095912772543463426";
const webChannelId = "1095913417711288420";

const serverCheck = function (client: Client, serviceStatus: any) {
  const apiURL = "https://cakrasoft.net/api/v1/ping";
  const webURL = "https://test.cakrasoft.net";

  // API SERVICE
  axios
    .get(apiURL)
    .then((response) => {
      const channel: TextChannel = client.channels.cache.get(
        apiChannelId
      ) as TextChannel;
      if (channel) {
        if (!serviceStatus.api) {
          channel.send(`API Service: \\🟢 UP`);
          channel.setName(`\\🟢-api-status`);
          serviceStatus.api = true;
        }
      } else {
        console.error("Unable to find the specified channel.");
      }
    })
    .catch((error) => {
      const channel = client.channels.cache.get(apiChannelId) as TextChannel;
      if (channel) {
        if (!serviceStatus.api) {
          channel.send(`API Service: \\🔴 DOWN`);
          channel.setName(`\\🔴-api-status`);
          serviceStatus.api = false;
        }
      } else {
        console.error("Unable to find the specified channel.");
      }
      console.error("Error occurred while trying to reach the server:", error);
    });

  //WEB SERVICE
  checkWebsiteExistence(webURL)
    .then((exists) => {
      if (exists) {
        const channel = client.channels.cache.get(webChannelId) as TextChannel;
        if (channel) {
          if (!serviceStatus.web) {
            channel.send(`Web Service: \\🟢 UP`);
            channel.setName(`\\🟢-web-status`);
            serviceStatus.web = true;
          }
        } else {
          console.error("Unable to find the specified channel.");
        }
      } else {
        const channel = client.channels.cache.get(webChannelId) as TextChannel;
        if (channel) {
          if (serviceStatus.web) {
            channel.send(`Web Service: \\🔴 DOWN`);
            channel.setName(`\\🔴-web-status`);
            serviceStatus.web = false;
          }
        } else {
          console.error("Unable to find the specified channel.");
        }
      }
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
};

async function checkWebsiteExistence(url: string) {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

export default serverCheck;
