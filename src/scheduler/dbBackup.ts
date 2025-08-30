import { Client, TextChannel } from "discord.js";

const { exec, execSync } = require("child_process");
const { format, addDays, startOfDay } = require("date-fns");
const fs = require("fs");
const tar = require("tar");
const zlib = require("zlib");

let backupDir = "/home/backup/databases";
const serverChannelId = "1095904872974520320";
const user = process.env.MYSQL_USER;
const pass = process.env.MYSQL_PASS;
const Host = "localhost";
const Port = "3308";
// const DumpOld =
//   "/usr/bin/mysqldump --events --routines --skip-add-drop-table --create-options --hex-blob --default-character-set=utf8";
const Dump =
  "/usr/bin/mysqldump --single-transaction --lock-tables=false --add-drop-database --events --routines --create-options --hex-blob --default-character-set=utf8";

const MySQL = "/usr/bin/mysql";

async function runBackup(client: Client) {
  console.log("Backing up databases...");
  const channel: TextChannel = client.channels.cache.get(
    serverChannelId
  ) as TextChannel;
  if (channel) {
    channel.send("Backing up databases...");
  } else {
    console.error("Unable to find the specified channel.");
  }

  const today = format(new Date(), "yyyyMMddHHmmss");
  const currentDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const tarFileName = `${backupDir}/${Host}-backup-${today}.tar.gz`;

  // Get a list of all databases
  const databases = execSync(
    `${MySQL} -u${user} -p${pass} -h ${Host} -P${Port} -e 'SHOW DATABASES'`,
    {
      encoding: "utf-8",
    }
  )
    .split("\n")
    .filter((db: any) => db);

  const ignoreDB = [
    "Database",
    "sys",
    "mysql",
    "performance_schema",
    "information_schema",
  ];

  const backupDirTar = `${backupDir}/${today}`;
  if (!fs.existsSync(backupDirTar)) {
    fs.mkdirSync(backupDirTar);
  }
  const tarCmd = `tar -czvf  ${tarFileName} ${backupDirTar}`;

  for (const db of databases) {
    if (ignoreDB.includes(db)) {
      continue;
    }

    const filename = `${backupDirTar}/${Host}-${db}_${today}.sql.gz`;
    const msg = await channel.send(
      `Backing up **${db}** to: ${filename}...<a:loading_blue_circle:1230149797852483684> `
    );
    console.log(`Backing up '${db}' from '${Host}' on '${currentDate}' to: `);
    console.log(`   ${filename}`);

    const dumpCmd = `${Dump} -u${user} -p${pass} -h ${Host} -P${Port} --databases ${db} | gzip > ${filename}`;
    // const dumpCmd = `${Dump} -u${user} -p${pass} -h ${Host} -P${Port} ${db} | gzip > ${filename}`; 

    await new Promise((resolve, reject) => {
      exec(dumpCmd, async (error1: any, stdout1: any, stderr1: any) => {
        if (error1) {
          console.error(`Error executing command 1: ${error1}`);
          msg.edit(`Backing up **${db}** to: ${filename}...\\❌ **FAILED** `);
          reject(`Error executing command 1: ${error1}`);
        }
        if (stderr1) {
          console.error(`stderr1 command 1: ${stderr1}`);
          // msg.edit(`Backing up **${db}** to: ${filename}...\\❌ **FAILED** `);
          // reject(`gzip stderr: ${stderr1}`);
        }
        if (stdout1) {
          console.error(`stdout1 command 1: ${stdout1}`);
        }
        msg.edit(`Backing up **${db}** to: ${filename}...\\✅ **DONE** `);
        resolve(`Backup of ${db} completed successfully`);
      });
    });
  }
  const msg2 = await channel.send(
    `Compressing backup to **${backupDirTar}**...<a:loading_blue_circle:1230149797852483684> `
  );

  await new Promise((resolve, reject) => {
    exec(tarCmd, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`Error executing tar command: ${error}`);
        msg2.edit(
          `Compressing backup to **${backupDirTar}**...\\❌ **FAILED** `
        );
        reject(`Error executing tar command: ${error}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        // msg2.edit(`Compressing backup to **${backupDir}**...\\❌ **FAILED** `);
        // reject(`Tar stderr: ${stderr}`);
        // return;
      }
      if (stdout) {
        console.log(`stdout: ${stdout}`);
      }

      msg2.edit(`Compressing backup to **${backupDirTar}**...\\✅ **DONE** `);
      fs.rmSync(backupDirTar, { recursive: true, force: true });

      //UPLOAD FILE
      const command2 = `/home/backup/gdrive files upload --parent 1-Gu0bhXkycuQlG7IulDtK00-ueUUUSEN ${tarFileName}`;
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
      console.log(`Backup completed: ${tarFileName}`);
      resolve("completed");
    });
  });

  // const filename = `${backupDir}/backup_${format(
  //   new Date(),
  //   "yyyyMMddHHmmss"
  // )}.sql.gz`;
  // const command1 = `mysqldump -uroot -pkalomang -P3308 --all-databases --events --routines --skip-add-drop-table --create-options --hex-blob --default-character-set=utf8 | gzip > ${filename}`;

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
  let scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    18,
    0,
    0
  );

  // Jika sekarang sudah lewat jam 18:00, jadwalkan untuk besok
  if (now.getTime() > scheduledTime.getTime()) {
    scheduledTime = new Date(
      addDays(startOfDay(now), 1).getFullYear(),
      addDays(startOfDay(now), 1).getMonth(),
      addDays(startOfDay(now), 1).getDate(),
      18,
      0,
      0
    );
  }

  const timeUntilNextRun = scheduledTime.getTime() - now.getTime();
  console.log(
    `Next backup scheduled at: ${format(scheduledTime, "yyyy-MM-dd HH:mm:ss")}`
  );

  setTimeout(() => {
    runBackup(client);
    scheduleDailyBackup(client);
  }, timeUntilNextRun);
}
// Start the scheduler
export { scheduleDailyBackup, runBackup };
