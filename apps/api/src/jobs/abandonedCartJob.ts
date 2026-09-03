import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { sendAbandonedCartEmail } from '../services/email.service.js';

export const startAbandonedCartJob = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running abandoned cart job...');
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);

            const abandonedCarts = await prisma.cart.findMany({
                where: {
                    updatedAt: {
                        lte: twentyFourHoursAgo,
                        gt: twentyFiveHoursAgo,
                    },
                    userId: { not: null },
                    items: {
                        some: {} // Cart must not be empty
                    }
                },
                include: {
                    user: true,
                }
            });

            for (const cart of abandonedCarts) {
                if (cart.user?.email) {
                    try {
                        await sendAbandonedCartEmail(
                            cart.user.email,
                            cart.user.firstName || 'Customer'
                        );
                        console.log(`Sent abandoned cart email to ${cart.user.email}`);
                    } catch (error) {
                        console.error(`Failed to send abandoned cart email to ${cart.user.email}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Error in abandoned cart job:', error);
        }
    });
};
