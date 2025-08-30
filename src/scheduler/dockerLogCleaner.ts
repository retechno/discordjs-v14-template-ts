import { TextChannel } from "discord.js";

const fs = require("fs");
const { execSync } = require("child_process");
const { format, addDays, startOfDay } = require("date-fns");

const LOG_PATH = "/var/lib/docker/containers";
const SIZE_LIMIT = 500 * 1024 * 1024; // 500MB

function getLargeLogs() {
  try {
    // Cari semua file *.log di folder container
    const output = execSync(
      `find ${LOG_PATH} -type f -name "*-json.log" -size +500M`,
      {
        encoding: "utf-8",
      }
    );
    return output.split("\n").filter((f: string) => f.trim() !== "");
  } catch (err) {
    return [];
  }
}

function clearLog(file: any,channel: TextChannel) {
  try {
    const stats = fs.statSync(file);
    if (stats.size > SIZE_LIMIT) {
      console.log(
        `⚡ Membersihkan: ${file} (size: ${(stats.size / (1024 * 1024)).toFixed(
          2
        )} MB)`
      );
      channel.send(
        `\\⚡ Membersihkan: ${file} (size: ${(stats.size / (1024 * 1024)).toFixed(
          2
        )} MB)`
      ); 
      // truncate isi file (kosongkan)
      fs.truncateSync(file, 0);
      console.log(`✅ ${file} sudah dikosongkan`);
      channel.send(`\\✅ ${file} sudah dikosongkan`);
    }
  } catch (err) {
    console.error(`❌ Gagal membersihkan ${file}:`, err.message);
    channel.send(`\\❌ Gagal membersihkan ${file}:  ${err.message}`);
  }
}

function runCleaner(channel: TextChannel) {
  // === Main ===
  console.log("🔍 Mencari log container > 500MB...");
  channel.send("\\🔍 Mencari log container > 500MB...");
  const logs = getLargeLogs();

  if (logs.length === 0) {
    console.log("Tidak ada log yang lebih besar dari 500MB.");
    channel.send("Tidak ada log yang lebih besar dari 500MB.");
  } else {
    logs.forEach(clearLog);
  }
}

export function scheduleDailyLogCleaner(channel: TextChannel) {
  const now = new Date();
  let scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    16,
    0,
    0
  );

  // Jika sekarang sudah lewat jam 18:00, jadwalkan untuk besok
  if (now.getTime() > scheduledTime.getTime()) {
    scheduledTime = new Date(
      addDays(startOfDay(now), 1).getFullYear(),
      addDays(startOfDay(now), 1).getMonth(),
      addDays(startOfDay(now), 1).getDate(),
      16,
      0,
      0
    );
  }

  const timeUntilNextRun = scheduledTime.getTime() - now.getTime();
  console.log(
    `Next backup scheduled at: ${format(scheduledTime, "yyyy-MM-dd HH:mm:ss")}`
  );

  setTimeout(() => {
    runCleaner(channel);
    scheduleDailyLogCleaner(channel);
  }, timeUntilNextRun);
}
