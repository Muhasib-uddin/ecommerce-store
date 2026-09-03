import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY || 're_12345');
const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const storeName = process.env.STORE_NAME || 'LUMIÈRE Store';

function getTemplate(templateName: string, data: Record<string, string>): string {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf-8');

    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value);
    }

    return template;
}

export const sendWelcomeEmail = async (email: string, name: string) => {
    try {
        const html = getTemplate('welcome', { 
            name, 
            storeName,
            storeUrl: process.env.FRONTEND_URL || process.env.STORE_URL || 'http://localhost:3000' 
        });

        const data = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Welcome to ${storeName}!`,
            html,
        });
        return data;
    } catch (error) {
        console.error('Error sending welcome email (logged, not breaking):', error);
        return null;
    }
};

export const sendPasswordResetEmail = async (email: string, name: string, resetUrl: string) => {
    try {
        const html = getTemplate('password-reset', {
            name,
            resetUrl,
            storeName,
        });

        const data = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Reset Your Password - ${storeName}`,
            html,
        });
        return data;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return null;
    }
};

export const sendEmailVerificationEmail = async (email: string, name: string, verifyUrl: string) => {
    try {
        const html = getTemplate('verify-email', {
            name,
            verifyUrl,
            storeName,
        });

        const data = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Verify Your Email Address - ${storeName}`,
            html,
        });
        return data;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return null;
    }
};

export const sendOrderConfirmationEmail = async (email: string, name: string, orderNumber: string, totalAmount: string) => {
    try {
        const html = getTemplate('order-confirmation', { 
            name, 
            orderNumber,
            totalAmount,
            storeName,
        });

        const data = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Order Confirmation - ${orderNumber}`,
            html,
        });
        return data;
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return null;
    }
};

export const sendOrderStatusUpdateEmail = async (email: string, name: string, orderNumber: string, status: string) => {
    try {
        const html = getTemplate('order-status', { 
            name, 
            orderNumber,
            status,
            storeName,
        });

        const data = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Order Status Update - ${orderNumber}`,
            html,
        });
        return data;
    } catch (error) {
        console.error('Error sending order status email:', error);
        return null;
    }
};

export const sendAbandonedCartEmail = async (email: string, name: string) => {
    try {
        const html = getTemplate('abandoned-cart', { 
            name, 
            storeName,
            checkoutUrl: `${process.env.FRONTEND_URL || process.env.STORE_URL || 'http://localhost:3000'}/checkout`
        });

        const data = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'Did you forget something?',
            html,
        });
        return data;
    } catch (error) {
        console.error('Error sending abandoned cart email:', error);
        return null;
    }
};

export const sendReviewRequestEmail = async (email: string, name: string, orderNumber: string) => {
    try {
        const html = getTemplate('review-request', { 
            name, 
            orderNumber,
            storeName,
            reviewUrl: `${process.env.FRONTEND_URL || process.env.STORE_URL || 'http://localhost:3000'}/orders/${orderNumber}/review`
        });

        const data = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'How did we do?',
            html,
        });
        return data;
    } catch (error) {
        console.error('Error sending review request email:', error);
        return null;
    }
};
