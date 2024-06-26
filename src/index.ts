import express from 'express';
import cors from 'cors';
import env from './config/env';
import GmailAPI from './services/GmailAPI';
import { emailProcessingQueue } from './queue/emailQueue';
import { Email } from './types';

const app = express();
app.use(cors());

async function processNewEmails() {
  try {
    const mailData = await GmailAPI.readNewInboxContent("to:therohitsharma2004@gmail.com");
    const emails: Email[] = JSON.parse(mailData);
    
    for (const email of emails) {
      await emailProcessingQueue.add('process', { 
        email: email.from, 
        subject: email.subject,
        content: email.body 
      });
    }
  } catch (error) {
    console.error("Error processing new emails:", error);
  }
}

setInterval(processNewEmails, 5 * 60 * 1000);
processNewEmails();

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});