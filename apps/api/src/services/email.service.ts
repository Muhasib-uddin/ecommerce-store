import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFromEmail = () => process.env.SMTP_FROM || process.env.EMAIL_FROM || 'support@gaitfootwear.com';
const getStoreName = () => process.env.STORE_NAME || 'GAIT Footwear';

let transporter: Transporter | null = null;

export const getSmtpTransporter = (): Transporter | null => {
    const host = process.env.SMTP_HOST;
    if (!host) return null;

    if (!transporter) {
        const port = Number(process.env.SMTP_PORT) || 465;
        const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

        transporter = nodemailer.createTransport({
            host,
            port,
            secure: isSecure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    return transporter;
};

export const verifySmtpConnection = async (): Promise<{ success: boolean; message: string }> => {
    const smtp = getSmtpTransporter();
    if (!smtp) {
        return { success: false, message: 'SMTP is not configured (SMTP_HOST is missing)' };
    }
    try {
        await smtp.verify();
        return { success: true, message: 'SMTP connection verified successfully' };
    } catch (err: any) {
        return { success: false, message: err?.message || 'SMTP verification failed' };
    }
};

const getResendClient = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && !apiKey.startsWith('re_12345') && apiKey.trim() !== '') {
        return new Resend(apiKey);
    }
    return null;
};

export interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export const sendMail = async ({ to, subject, html, from }: SendMailOptions) => {
    const sender = from || `"${getStoreName()}" <${getFromEmail()}>`;
    const rawFrom = from || getFromEmail();

    // 1. Try SMTP if configured
    const smtp = getSmtpTransporter();
    if (smtp && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            const info = await smtp.sendMail({
                from: sender,
                to,
                subject,
                html,
            });
            console.log(`[Email Service] Sent email to ${to} via SMTP (MessageId: ${info.messageId})`);
            return { success: true, messageId: info.messageId, provider: 'smtp' };
        } catch (error) {
            console.error(`[Email Service] SMTP error sending to ${to}:`, error);
            // Fall through to try Resend if available
        }
    }

    // 2. Try Resend if configured
    const resend = getResendClient();
    if (resend) {
        try {
            const data = await resend.emails.send({
                from: rawFrom,
                to,
                subject,
                html,
            });
            console.log(`[Email Service] Sent email to ${to} via Resend`);
            return { success: true, data, provider: 'resend' };
        } catch (error) {
            console.error(`[Email Service] Resend error sending to ${to}:`, error);
        }
    }

    console.warn(`[Email Service] No active email provider succeeded for ${to}. Subject: "${subject}"`);
    return null;
};

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
        const storeName = getStoreName();
        const html = getTemplate('welcome', { 
            name, 
            storeName,
            storeUrl: process.env.FRONTEND_URL || process.env.STORE_URL || 'http://localhost:3000' 
        });

        return await sendMail({
            to: email,
            subject: `Welcome to ${storeName}!`,
            html,
        });
    } catch (error) {
        console.error('Error sending welcome email (logged, not breaking):', error);
        return null;
    }
};

export const sendPasswordResetEmail = async (email: string, name: string, resetUrl: string) => {
    try {
        const storeName = getStoreName();
        const html = getTemplate('password-reset', {
            name,
            resetUrl,
            storeName,
        });

        return await sendMail({
            to: email,
            subject: `Reset Your Password - ${storeName}`,
            html,
        });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return null;
    }
};

export const sendEmailVerificationEmail = async (email: string, name: string, verifyUrl: string) => {
    try {
        const storeName = getStoreName();
        const html = getTemplate('verify-email', {
            name,
            verifyUrl,
            storeName,
        });

        return await sendMail({
            to: email,
            subject: `Verify Your Email Address - ${storeName}`,
            html,
        });
    } catch (error) {
        console.error('Error sending verification email:', error);
        return null;
    }
};

export const sendOrderConfirmationEmail = async (email: string, name: string, orderNumber: string, totalAmount: string) => {
    try {
        const storeName = getStoreName();
        const html = getTemplate('order-confirmation', { 
            name, 
            orderNumber,
            totalAmount,
            storeName,
        });

        return await sendMail({
            to: email,
            subject: `Order Confirmation - ${orderNumber}`,
            html,
        });
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return null;
    }
};

export const sendOrderStatusUpdateEmail = async (email: string, name: string, orderNumber: string, status: string) => {
    try {
        const storeName = getStoreName();
        const html = getTemplate('order-status', { 
            name, 
            orderNumber,
            status,
            storeName,
        });

        return await sendMail({
            to: email,
            subject: `Order Status Update - ${orderNumber}`,
            html,
        });
    } catch (error) {
        console.error('Error sending order status email:', error);
        return null;
    }
};

export const sendAbandonedCartEmail = async (email: string, name: string) => {
    try {
        const storeName = getStoreName();
        const html = getTemplate('abandoned-cart', { 
            name, 
            storeName,
            checkoutUrl: `${process.env.FRONTEND_URL || process.env.STORE_URL || 'http://localhost:3000'}/checkout`
        });

        return await sendMail({
            to: email,
            subject: 'Did you forget something?',
            html,
        });
    } catch (error) {
        console.error('Error sending abandoned cart email:', error);
        return null;
    }
};

export const sendReviewRequestEmail = async (email: string, name: string, orderNumber: string) => {
    try {
        const storeName = getStoreName();
        const html = getTemplate('review-request', { 
            name, 
            orderNumber,
            storeName,
            reviewUrl: `${process.env.FRONTEND_URL || process.env.STORE_URL || 'http://localhost:3000'}/orders/${orderNumber}/review`
        });

        return await sendMail({
            to: email,
            subject: 'How did we do?',
            html,
        });
    } catch (error) {
        console.error('Error sending review request email:', error);
        return null;
    }
};
