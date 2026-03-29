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
        console.error("CRITICAL: EMAIL_USER or EMAIL_PASS not found in environment.");
        throw { statusCode: 500, message: "Server email configuration is missing or incomplete." };
    }

    console.log(`Sending email to: ${recipient}`);
    try {
        const mailOptions = {
            from: mainconfig.emailUser,
            to: recipient,
            subject: subject,
            html: body,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export default sendEmail;