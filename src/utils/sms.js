import twilio from 'twilio';
import config from '../config/index.js';

const accountSid = config.twilio.sid;
const authToken = config.twilio.authToken;

async function sendSMS(to, body) {
    if (!accountSid || !authToken || !config.twilio.phoneNumber) {
        console.error("[SMS CONFIG ERROR] Twilio SID, Auth Token, or Phone Number missing.");
        throw new Error("SMS configuration incomplete. Please verify your .env file.");
    }

    const client = twilio(accountSid, authToken);

    try {
        const message = await client.messages.create({
            body: body,
            from: config.twilio.phoneNumber,
            to: to

        });
        console.log(`[SMS] Sent to ${to}:`, message.sid);
        return message;
    } catch (error) {
        console.error('[SMS ERROR]:', error.message);
        throw new Error(`SMS delivery failed: ${error.message}`);
    }
}

export default sendSMS;