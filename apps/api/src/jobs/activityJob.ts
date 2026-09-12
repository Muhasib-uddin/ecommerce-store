import cron from 'node-cron';
import { activityService } from '../services/activity.service.js';

let flushTimer: NodeJS.Timeout | null = null;

export const startActivityJobs = () => {
  console.log('Starting Customer Activity buffer flush & retention jobs...');

  // 1. Flush Redis buffer to PostgreSQL every 5 seconds
  if (!flushTimer) {
    flushTimer = setInterval(async () => {
      try {
        const count = await activityService.flushActivities(250);
        if (count > 0) {
          console.log(`[ActivityJob] Flushed ${count} customer activities to database`);
        }
      } catch (err) {
        console.error('[ActivityJob] Error flushing activity buffer:', err);
      }
    }, 5000);
  }

  // 2. Daily cleanup of activities beyond retention period (default 90 days) at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[ActivityJob] Running daily customer activity retention cleanup...');
    try {
      const retentionDays = process.env.ACTIVITY_RETENTION_DAYS
        ? parseInt(process.env.ACTIVITY_RETENTION_DAYS, 10)
        : 90;
      const count = await activityService.cleanupOldActivities(retentionDays);
      console.log(`[ActivityJob] Cleaned up ${count} activities older than ${retentionDays} days`);
    } catch (err) {
      console.error('[ActivityJob] Error cleaning up old activities:', err);
    }
  });
};

export const stopActivityJobs = () => {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
};
