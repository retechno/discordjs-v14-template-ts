import { Client, TextChannel } from "discord.js";

const { exec } = require("child_process");
const { format, addDays, startOfDay } = require("date-fns");

const backupDir = "/home/backup/databases";
const serverChannelId = "1095904872974520320";

function runBackup(client: Client) {
  console.log("Backing up databases...");
  const channel: TextChannel = client.channels.cache.get(
    serverChannelId
  ) as TextChannel;
  if (channel) {
    channel.send("Backing up databases...");
  } else {
    console.error("Unable to find the specified channel.");
  }
  const filename = `${backupDir}/backup_${format(
    new Date(),
    "yyyyMMddHHmmss"
  )}.sql.gz`;
  const command1 = `mysqldump -uroot -pkalomang -P3308 --all-databases --events --routines --skip-add-drop-table --create-options --hex-blob --default-character-set=utf8 | gzip > ${filename}`;
  const command2 = `/home/backup/gdrive files upload --parent 1-Gu0bhXkycuQlG7IulDtK00-ueUUUSEN ${filename}`;

  exec(command1, (error1: any, stdout1: any, stderr1: any) => {
    if (error1) {
      console.error(`Error executing command 1: ${error1}`);
      return;
    }

    exec(command2, (error2: any, stdout2: any, stderr2: any) => {
      if (error2) {
        console.error(`Error executing command 2: ${error2}`);
        return;
      }

      // const command3 = `find ${backupDir} -mtime +10 -type f -delete`;
      // exec(command3, (error3: any, stdout3: any, stderr3: any) => {
      //   if (error3) {
      //     console.error(`Error executing command 3: ${error3}`);
      //     return;
      //   }

      const command4 = `ls -1 ${backupDir} | wc -l`;
      exec(command4, (error4: any, stdout4: string, stderr4: any) => {
        if (error4) {
          console.error(`Error executing command 4: ${error4}`);
          return;
        }

        const fileCount = parseInt(stdout4);

        if (fileCount > 15) {
          const excess = fileCount - 15;
          const command5 = `ls -1t ${backupDir} | tail -n ${excess} | xargs -I {} rm -f ${backupDir}/{}`;
          exec(command5, (error5: any, stdout5: any, stderr5: any) => {
            if (error5) {
              console.error(`Error executing command 5: ${error5}`);
              return;
            }
            console.log("File cleanup complete.");
          });
        }
      });
      // });
    });
  });
  console.log("Back up databases done.");
  if (channel) {
    channel.send("Back up databases done.");
  } else {
    console.error("Unable to find the specified channel.");
  }
}

// Schedule the backup to run daily at 18:00
function scheduleDailyBackup(client: Client) {
  const now = new Date();
  const tomorrow = addDays(startOfDay(now), 1);
  const scheduledTime = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate(),
    18,
    0,
    0
  ); // Set the time here

  const timeUntilNextRun = scheduledTime.getTime() - now.getTime();

  setTimeout(() => {
    runBackup(client);
    // Schedule next backup
    scheduleDailyBackup(client);
  }, timeUntilNextRun);
}

// Start the scheduler
export default scheduleDailyBackup;
