import GmailAPI from './GmailAPI';

class EmailService {
  private gmailAPI: typeof GmailAPI;

  constructor() {
    this.gmailAPI = GmailAPI;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      const message = { to, subject, body };
      await this.gmailAPI.sendEmail(message);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw error;
    }
  }
}

export default new EmailService();