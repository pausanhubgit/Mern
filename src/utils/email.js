import mainconfig from '../config/index.js';
import { Resend } from 'resend';


const resend = new Resend(mainconfig.emailApiKey);

async function sendEmail(recipient, {subject, body}) {
    console.log(recipient);
        const {data,error}=await resend.emails.send({
                from: "Acme <onboarding@resend.dev>", 
                to: 'poushan.chy12@gmail.com'||[recipient], //recipient not working
                subject,
                html:body,
});
    if(error){
        return console.log(error);
    }
}

// async function sendEmail(recipient, {subject, body}) {
//     const {data,error}=await resend.emails.send({
//         from: "Acme <onboarding@resend.dev>", 
//         to: 'poushan.chy12@gmail.com'||[recipient], //recipient not working
//         subject:"Hello World",
//         html:body,
// });
//   if(error){
//     return console.log(error);
//   }
// }

export default sendEmail;