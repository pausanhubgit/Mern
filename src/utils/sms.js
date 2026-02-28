import twilio from 'twilio';
import config from '../config/index.js';

    const accountSid = config.twilio.sid;
    const authToken = config.twilio.authToken;

async function sendSMS(){
    const client = twilio(accountSid, authToken);

   return await client.messages.create({
        body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
        from: '+15017122661',
        to: '+15558675310'
    }).then(message => console.log(message.sid));
};

export default sendSMS;