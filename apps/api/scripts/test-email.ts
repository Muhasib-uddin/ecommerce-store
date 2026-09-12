import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';

// Load environment variables (matching apps/api/src/index.ts)
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), `../../.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const targetRecipient = process.argv[2] || process.env.SMTP_USER || 'support@gaitfootwear.com';

console.log('\n======================================================');
console.log(' GAIT FOOTWEAR — EMAIL CONFIGURATION TEST');
console.log('======================================================');
console.log(`Environment:      ${nodeEnv}`);
console.log(`SMTP Host:        ${process.env.SMTP_HOST || '(NOT SET)'}`);
console.log(`SMTP Port:        ${process.env.SMTP_PORT || '465'}`);
console.log(`SMTP Secure:      ${process.env.SMTP_SECURE || 'true'}`);
console.log(`SMTP User:        ${process.env.SMTP_USER || '(NOT SET)'}`);
console.log(`SMTP Password:    ${process.env.SMTP_PASS ? '****** (Provided)' : '(NOT SET)'}`);
console.log(`Store Name:       ${process.env.STORE_NAME || 'GAIT Footwear'}`);
console.log(`From Address:     ${process.env.SMTP_FROM || process.env.EMAIL_FROM || '(NOT SET)'}`);
console.log(`IMAP Host:        ${process.env.IMAP_HOST || '(NOT SET)'}`);
console.log(`IMAP Port:        ${process.env.IMAP_PORT || '993'}`);
console.log(`Testing To:       ${targetRecipient}`);
console.log('======================================================\n');

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Error: Missing SMTP credentials in environment variables.');
    process.exit(1);
}

const port = Number(process.env.SMTP_PORT) || 465;
const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: isSecure,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function runTest() {
    try {
        console.log('⏳ 1. Verifying SMTP server handshake and credentials...');
        await transporter.verify();
        console.log('✅ SMTP connection successfully authenticated!\n');

        console.log(`⏳ 2. Dispatching test email to ${targetRecipient}...`);
        const info = await transporter.sendMail({
            from: `"${process.env.STORE_NAME || 'GAIT Footwear'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: targetRecipient,
            subject: 'GAIT Footwear — SMTP Integration Test',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #1a1a1a; margin-bottom: 8px;">GAIT Footwear Email System</h2>
                    <p style="color: #4a4a4a; font-size: 15px;">Congratulations! Your Hostinger SMTP configuration is active and working properly.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <table style="width: 100%; font-size: 14px; color: #555;">
                        <tr><td><strong>SMTP Host:</strong></td><td>${process.env.SMTP_HOST}</td></tr>
                        <tr><td><strong>Port:</strong></td><td>${port} (Secure: ${isSecure})</td></tr>
                        <tr><td><strong>Sender:</strong></td><td>${process.env.SMTP_FROM || process.env.SMTP_USER}</td></tr>
                        <tr><td><strong>Timestamp:</strong></td><td>${new Date().toISOString()}</td></tr>
                    </table>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #888;">This is an automated test email sent from the GAIT Footwear API server.</p>
                </div>
            `,
            text: `GAIT Footwear Email Test\n\nYour Hostinger SMTP configuration is working properly!\nHost: ${process.env.SMTP_HOST}\nPort: ${port}\nTimestamp: ${new Date().toISOString()}`,
        });

        console.log('✅ Test email sent successfully!');
        console.log(`   Message ID:  ${info.messageId}`);
        console.log(`   Accepted:    ${info.accepted.join(', ')}`);
        if (info.rejected.length > 0) {
            console.warn(`   ⚠️ Rejected: ${info.rejected.join(', ')}`);
        }
        console.log('\n🎉 ALL CHECKS PASSED!\n');
    } catch (error: any) {
        console.error('\n❌ SMTP Test failed:');
        console.error(error.message || error);
        if (error.response) {
            console.error('Server response:', error.response);
        }
        process.exit(1);
    }
}

runTest();
