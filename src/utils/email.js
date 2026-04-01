import nodemailer from 'nodemailer';
import mainconfig from '../config/index.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: mainconfig.emailUser,
        pass: mainconfig.emailPass,
    },
});

async function sendEmail(recipient, { subject, body }) {
    if (!mainconfig.emailUser || !mainconfig.emailPass) {
        console.error("[EMAIL CONFIG ERROR] EMAIL_USER or EMAIL_PASS missing in environment.");
        throw {
            statusCode: 500,
            message: "Backend email configuration is incomplete. Check Vercel Environment Variables."
        };
    }

    console.log(`[EMAIL] Attempting to send to: ${recipient}`);
    try {
        const mailOptions = {
            from: mainconfig.emailUser,
            to: recipient,
            subject: subject,
            html: body,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('[EMAIL] Sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('[EMAIL ERROR] Detailed failure:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        throw {
            statusCode: 500,
            message: `Email delivery failed: ${error.message}. Ensure App Passwords are used.`
        };
    }
}

export default sendEmail;