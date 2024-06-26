import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import env from '../config/env';
import OpenAIService from '../services/OpenAiService';
import EmailService from '../services/EmailService';

const connection = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
});

export const emailProcessingQueue = new Queue('emailProcessing', { connection });

async function processEmail(job: Job) {
  const { email, subject, content } = job.data;
  
  try {
    const category = await OpenAIService.categorizeEmail(content);
    const response = await OpenAIService.generateResponse(content, category);
    console.log(`Generated response for email from ${email}: ${response}`);
    
    await EmailService.sendEmail(email, `Re: ${subject} - ${category}`, response);
    
    return { email, category, response };
  } catch (error) {
    console.error(`Error processing email for ${email}:`, error);
    throw error;
  }
}

export const emailWorker = new Worker('emailProcessing', processEmail, { 
  connection,
  concurrency: 5,
  limiter: {
    max: 1000,
    duration: 5000
  }
});

emailWorker.on('completed', (job) => {
  console.log(`Processed email: ${job.returnvalue.email}, Category: ${job.returnvalue.category}`);
});

emailWorker.on('failed', (job:any, err) => {
  console.error(`Email processing job ${job.id} failed:`, err);
  if (job.attemptsMade < 3) {
    job.retry();
  }
});

process.on('SIGTERM', async () => {
  console.log('Shutting down email worker...');
  await emailWorker.close();
  await connection.quit();
  process.exit(0);
});