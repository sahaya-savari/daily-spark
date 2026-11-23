package com.santhosh.dailyspark2;

import android.app.job.JobParameters;
import android.app.job.JobService;

public class FolderBackupJob extends JobService {
  private volatile Thread worker;

  @Override
  public boolean onStartJob(JobParameters parameters) {
    worker = new Thread(() -> {
      Thread running = Thread.currentThread();
      try {
        FolderBackup.save(this, false);
      } catch (Exception error) {
        FolderBackup.preferences(this).edit().putString("error", "Backup could not run. Check the selected folder.").apply();
      } finally {
        if (worker == running) jobFinished(parameters, false);
      }
    }, "daily-spark-folder-backup");
    worker.start();
    return true;
  }

  @Override
  public boolean onStopJob(JobParameters parameters) {
    worker = null;
    return true;
  }
}
