
# Email Processing Service

This project is an email processing service that uses the Gmail API to read new emails, process them using OpenAI, and send responses uses BullMQ for automation. The project includes components for fetching emails, categorizing and responding to them using OpenAI, and sending responses via email.


## Prerequisites
- Node.js (v14 or later)
- Google Cloud Project with Gmail API enabled
- OAuth2 credentials for Google API
- Redis instance for BullMQ
- Axios
- Nodemailer
- BullMQ
- OpenAI API credentials

## Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/rohit0033/Email-Automation.git
   cd email-automation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment variables:**
   Create a `.env` file in the root of your project and configure it with your environment variables.

## Configuration

Edit the .env file with your application's configuration:

PORT: The port number on which the application will run.
REDIS_URL: Your Aiven Redis instance URL.
OPENAI_API_KEY: Your OpenAI API key for additional integrations.
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_REDIRECT_URI: Your Google OAuth2 credentials.
 - Make sure to set these environment variables in your `.env` file.

## Usage
1. **Gmail API:**
   - The GmailAPI class is used to fetch and read new emails from your Gmail inbox.
   - It uses OAuth2 for authentication and token management.

2. **Email Service:**
   - The EmailService class handles sending emails using the Gmail API.
   - It constructs the email body and sends it via Gmail.

3. **Email Queue:**
   - BullMQ is used to process emails asynchronously.
   - The `emailProcessingQueue` adds new emails to the queue for processing.
   - The `emailWorker` processes emails from the queue, categorizes them using OpenAI, and sends responses.




### Description of Key Files
- **index.ts:** Main entry point for the application. Sets up the server, processes new emails, and listens on the configured port.
- **GmailAPI.ts:** Handles reading new emails from Gmail using the Gmail API.
- **EmailService.ts:** Sends emails using the Gmail API.
- **emailQueue.ts:** Manages the email processing queue using BullMQ.
- **OpenAiService.ts:** (Assumed to exist) Interacts with OpenAI to categorize emails and generate responses.

## Running the Application
1. **Start the server:**
   ```bash
   npm run dev
   ```
   The server will start and begin processing emails from your Gmail inbox every 5 minutes.

2. **Shutting down the server:**
   The server will handle graceful shutdown on `SIGTERM`.


