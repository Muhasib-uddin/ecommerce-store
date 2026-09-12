import { startAbandonedCartJob } from './abandonedCartJob.js';
import { startReviewRequestJob } from './reviewRequestJob.js';
import { startActivityJobs } from './activityJob.js';

export const initCronJobs = () => {
    console.log('Initializing background cron jobs...');
    startAbandonedCartJob();
    startReviewRequestJob();
    startActivityJobs();
};
