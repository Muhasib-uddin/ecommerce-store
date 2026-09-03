import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { sendReviewRequestEmail } from '../services/email.service.js';
import { OrderStatus } from '@prisma/client';

export const startReviewRequestJob = () => {
    // Run daily at noon
    cron.schedule('0 12 * * *', async () => {
        console.log('Running review request job...');
        try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

            const deliveredOrders = await prisma.order.findMany({
                where: {
                    status: OrderStatus.DELIVERED,
                    updatedAt: {
                        lte: sevenDaysAgo,
                        gt: eightDaysAgo,
                    },
                    userId: { not: null }
                },
                include: {
                    user: true,
                }
            });

            for (const order of deliveredOrders) {
                if (order.user?.email) {
                    try {
                        await sendReviewRequestEmail(
                            order.user.email,
                            order.shippingName || order.user.firstName || 'Customer',
                            order.orderNumber
                        );
                        console.log(`Sent review request email for order ${order.orderNumber}`);
                    } catch (error) {
                        console.error(`Failed to send review request email for order ${order.orderNumber}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Error in review request job:', error);
        }
    });
};
