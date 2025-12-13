type BackupJob = () => Promise<void>;

class BackupQueue {
  private queue: BackupJob[] = [];
  private running = false;

  enqueue(job: BackupJob) {
    this.queue.push(job);
    this.process();
  }

  private async process() {
    if (this.running) return;
    if (this.queue.length === 0) return;

    this.running = true;
    const job = this.queue.shift()!;

    try {
      await job();
    } catch (err) {
      console.error("Backup job failed:", err);
    } finally {
      this.running = false;
      this.process(); // lanjut job berikutnya
    }
  }
}

// 🔒 SINGLE INSTANCE
export const backupQueue = new BackupQueue();
