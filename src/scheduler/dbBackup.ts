import { Client, TextChannel } from "discord.js";

const { exec, execSync } = require("child_process");
const { format, addDays, startOfDay } = require("date-fns");
const fs = require("fs");
const tar = require("tar");
const zlib = require("zlib");

let backupDir = "/home/backup/databases";
const serverChannelId = "1095904872974520320";
// const DumpOld =
//   "/usr/bin/mysqldump --events --routines --skip-add-drop-table --create-options --hex-blob --default-character-set=utf8";
const Dump =
  "/usr/bin/mysqldump --single-transaction --lock-tables=false --add-drop-database --events --routines --create-options --hex-blob --default-character-set=utf8";

const MySQL = "/usr/bin/mysql";

async function runBackup(
  client: Client,
  Host: string,
  Port: string,
  user: string,
  pass: string,
  dbname?: string
): Promise<void> {
  const channel = client.channels.cache.get(serverChannelId) as TextChannel | null;
  if (channel) channel.send("Backing up databases...");

  const today = format(new Date(), "yyyyMMddHHmmss");
  const currentDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const tarDir = `${backupDir}/${Host}/${today}`;
  let tarFileName = `${backupDir}/${Host}-backup-${today}.tar.gz`;

  if (!fs.existsSync(tarDir)) {
    fs.mkdirSync(tarDir, { recursive: true });
  }

  // 1. Tentukan database list
  let databases: string[] = [];

  if (dbname) {
    databases = [dbname]; // SINGLE BACKUP
    tarFileName = `${backupDir}/${Host}-${dbname}-${today}.tar.gz`;
  } else {
    const raw = execSync(
      `${MySQL} -u${user} -p${pass} -h ${Host} -P${Port} -e "SHOW DATABASES"`,
      { encoding: "utf-8" }
    )
      .split("\n")
      .map((x: string) => x.trim())
      .filter((x: string) => x.length > 0);

    const ignoreDB = [
      "Database",
      "sys",
      "mysql",
      "performance_schema",
      "information_schema"
    ];

    databases = raw.filter((db: string) => !ignoreDB.includes(db));
  }

  // 2. Backup per DB
  for (const db of databases) {
    const filename = `${tarDir}/${Host}-${db}_${today}.sql.gz`;

    const msg = channel
      ? await channel.send(`Backing up **${db}**... <a:loading_blue_circle:1230149797852483684>`)
      : null;

    console.log(`Backing up '${db}' from '${Host}' on '${currentDate}' → ${filename}`);

    const dumpCmd = `${Dump} -u${user} -p${pass} -h ${Host} -P${Port} --databases ${db} | gzip > ${filename}`;

    await new Promise<void>((resolve, reject) => {
      exec(dumpCmd, (error:any, stdout:any, stderr:any) => {
        if (error) {
          console.error(`Backup error for DB ${db}:`, error);
          if (msg) msg.edit(`Backing up **${db}**... ❌ **FAILED**`);
          reject(error);
          return;
        }

        if (msg) msg.edit(`Backing up **${db}**... ✅ **DONE**`);
        resolve();
      });
    });
  }

  // 3. Compress folder
  const msg2 = channel
    ? await channel.send(`Compressing... <a:loading_blue_circle:1230149797852483684>`)
    : null;

  const tarCmd = `tar -czvf ${tarFileName} ${tarDir}`;

  await new Promise<void>((resolve, reject) => {
    exec(tarCmd, (error:any) => {
      if (error) {
        if (msg2) msg2.edit(`Compressing... ❌ **FAILED**`);
        reject(error);
        return;
      }

      if (msg2) msg2.edit(`Compressing... ✅ **DONE**`);
      fs.rmSync(tarDir, { recursive: true, force: true });
      resolve();
    });
  });

  // 4. Upload to Google Drive
  const uploadCmd = `/home/backup/gdrive files upload --parent 1-Gu0bhXkycuQlG7IulDtK00-ueUUUSEN ${tarFileName}`;
  exec(uploadCmd, (error:any) => {
    if (error) {
      console.error("GDrive upload failed:", error);
    }
  });

  // 5. Auto-clean 15 file terakhir
  exec(`ls -1 ${backupDir} | wc -l`, (err:any, stdout:any) => {
    if (err) return;

    const fileCount = parseInt(stdout);
    if (fileCount > 15) {
      const excess = fileCount - 15;
      const cleanCmd = `ls -1t ${backupDir} | tail -n ${excess} | xargs -I {} rm -f ${backupDir}/{}`;
      exec(cleanCmd, () => {});
    }
  });

  if (channel) channel.send("Back up databases done.");
  console.log("Backup Completed:", tarFileName);
}


// Schedule the backup to run daily at 18:00

function scheduleDailyBackup(client: Client, Host:string,Port:string, user:string, pass:string) {
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
    runBackup(client, Host,Port, user, pass);
    scheduleDailyBackup(client, Host,Port, user, pass);
  }, timeUntilNextRun);
}
// Start the scheduler
export { scheduleDailyBackup, runBackup };
