import axios from "axios";
import { Client, TextChannel } from "discord.js";
import { execScript } from "../functions";
const apiChannelId = "1095912772543463426";
const webChannelId = "1095913417711288420";
let failCountAPI1 = 0;
let failCountAPI2 = 0;
let failCountAPICM = 0;

const serverCheck = function (client: Client, serviceStatus: any) {
  const apiURL = "https://cakrasoft.net/api/v1/ping";
  const apiURL1 = "http://209.97.160.250:9000/ping";
  const apiURL2 = "http://209.97.160.250:9900/ping";
  const apiCMURL = "http://209.97.160.250:9005/ping";
  const webURL = "https://test.cakrasoft.net";

  const restartCommandAPI1 = "docker container restart api_v1.0.7";
  const restartCommandAPI2 = "docker container restart api_v1.0.7_dupe";
  const restartCommandAPICM = "docker container restart api_cm";

  // API SERVICE LOAD BALANCER
  axios
    .get(apiURL)
    .then((response) => {
      const channel: TextChannel = client.channels.cache.get(
        apiChannelId
      ) as TextChannel;
      if (channel) {
        if (!serviceStatus.api) {
          channel.send(`API Service Load Balance: \\🟢 UP`);
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
        if (serviceStatus.api) {
          channel.send(
            `API Service Load Balance: \\🔴 DOWN <@668740503075815424>`
          );
          channel.setName(`\\🔴-api-status`);
          serviceStatus.api = false;
        }
      } else {
        console.error("Unable to find the specified channel.");
      }
      console.error("Error occurred while trying to reach the server:", error);
    });

  // API SERVICE 1
  axios
    .get(apiURL1)
    .then((response) => {
      console.log(`SUCCESS ${apiURL1}`);
      failCountAPI1 = 0;
      const channel: TextChannel = client.channels.cache.get(
        apiChannelId
      ) as TextChannel;
      if (channel) {
        if (!serviceStatus.api1) {
          channel.send(`API Service 1: \\🟢 UP`);
          // channel.setName(`\\🟢-api-status`);
          serviceStatus.api1 = true;
        }
      } else {
        console.error("Unable to find the specified channel.");
      }
    })
    .catch(async (error) => {
      failCountAPI1++;
      console.log(`FAIL ${apiURL1} COUNT: ${failCountAPI1}`);
      let output;
      if (failCountAPI1 >= 5) {
        try {
          output = await execScript(restartCommandAPI1);
        } catch (err) {
          console.log(err);
        }
      }
      const channel = client.channels.cache.get(apiChannelId) as TextChannel;
      if (channel) {
        if (serviceStatus.api1) {
          channel.send(`API Service 1: \\🔴 DOWN <@668740503075815424>`);
          // channel.setName(`\\🔴-api-status`);
          serviceStatus.api1 = false;
        }
        if (output) {
          channel.send(`API Service 1: ${output}`);
        }
      } else {
        console.error("Unable to find the specified channel.");
      }
      console.error("Error occurred while trying to reach the server:", error);
    });

  // API SERVICE 2
  axios
    .get(apiURL2)
    .then((response) => {
      console.log(`SUCCESS ${apiURL2}`);
      failCountAPI2 = 0;
      const channel: TextChannel = client.channels.cache.get(
        apiChannelId
      ) as TextChannel;
      if (channel) {
        if (!serviceStatus.api2) {
          channel.send(`API Service 2: \\🟢 UP`);
          // channel.setName(`\\🟢-api-status`);
          serviceStatus.api2 = true;
        }
      } else {
        console.error("Unable to find the specified channel.");
      }
    })
    .catch(async (error) => {
      failCountAPI2++;
      console.log(`FAIL ${apiURL2} COUNT2: ${failCountAPI2}`);
      let output;
      if (failCountAPI2 >= 5) {
        try {
          output = await execScript(restartCommandAPI2);
        } catch (err) {
          console.log(err);
        }
      }
      const channel = client.channels.cache.get(apiChannelId) as TextChannel;
      if (channel) {
        if (serviceStatus.api2) {
          channel.send(`API Service 2: \\🔴 DOWN <@668740503075815424>`);
          // channel.setName(`\\🔴-api-status`);
          serviceStatus.api2 = false;
        }

        if (output) {
          channel.send(`API Service 2: ${output}`);
        }
      } else {
        console.error("Unable to find the specified channel.");
      }
      console.error("Error occurred while trying to reach the server:", error);
    });

  // API CM SERVICE
  axios
    .get(apiCMURL)
    .then((response) => {
      console.log(`SUCCESS ${apiCMURL}`);
      failCountAPICM = 0;
      const channel: TextChannel = client.channels.cache.get(
        apiChannelId
      ) as TextChannel;
      if (channel) {
        if (!serviceStatus.apiCM) {
          channel.send(`API Service CM: \\🟢 UP`);
          // channel.setName(`\\🟢-api-status`);
          serviceStatus.apiCM = true;
        }
      } else {
        console.error("Unable to find the specified channel.");
      }
    })
    .catch(async (error) => {
      failCountAPICM++;
      console.log(`FAIL ${apiCMURL} COUNT2: ${failCountAPICM}`);
      let output;
      if (failCountAPICM >= 5) {
        try {
          output = await execScript(restartCommandAPICM);
        } catch (err) {
          console.log(err);
        }
      }
      const channel = client.channels.cache.get(apiChannelId) as TextChannel;
      if (channel) {
        if (serviceStatus.apiCM) {
          channel.send(`API Service CM: \\🔴 DOWN <@668740503075815424>`);
          // channel.setName(`\\🔴-api-status`);
          serviceStatus.apiCM = false;
        }

        if (output) {
          channel.send(`API Service CM: ${output}`);
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
            channel.send(`Web Service: \\🔴 DOWN <@668740503075815424>`);
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
