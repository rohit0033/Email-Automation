import axios, { AxiosRequestConfig } from "axios";
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import env from '../config/env';

class GmailAPI {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      env.googleClientId,
      env.googleClientSecret,
      env.googleRedirectUri
    );

    this.oauth2Client.setCredentials({
      refresh_token: env.googleRefreshToken
    });
  }

  private async getAccessToken(): Promise<string> {
    const { token } = await this.oauth2Client.getAccessToken();
    if (!token) throw new Error('Failed to get access token');
    return token;
  }

  public async readNewInboxContent(searchText: string): Promise<string> {
    const accessToken = await this.getAccessToken();
    const threadIds = await this.searchAllGmail(searchText, 5, accessToken);
    let newEmails = [];

    for (const threadId of threadIds) {
      const message = await this.readGmailContent(threadId, accessToken);

      if (!message || !message.payload || !message.payload.headers) {
        console.error('Invalid message data:', message);
        continue;
      }

      const headers = message.payload.headers;
      const from = headers.find((h: { name: string; }) => h.name === "From")?.value || "";
      const subject = headers.find((h: { name: string; }) => h.name === "Subject")?.value || "";

      let body = '';
      if (message.payload.parts) {
        for (const part of message.payload.parts) {
          if (part.mimeType === "text/plain" && part.body && part.body.data) {
            body += Buffer.from(part.body.data, "base64").toString("utf-8");
          }
        }
      } else if (message.payload.body && message.payload.body.data) {
        body = Buffer.from(message.payload.body.data, "base64").toString("utf-8");
      }

      body = body.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');

      newEmails.push({ from, subject, body });
    }

    return JSON.stringify(newEmails, null, 2);
  }

  public async searchAllGmail(searchItem: string, maxResults: number, accessToken: string): Promise<string[]> {
    const config: AxiosRequestConfig = {
      method: "get",
      url: `https://www.googleapis.com/gmail/v1/users/me/messages?q=${searchItem}&maxResults=${maxResults}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios(config);
      return response.data.messages.map((message: { id: string }) => message.id);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async readGmailContent(messageId: string, accessToken: string): Promise<any> {
    const config: AxiosRequestConfig = {
      method: "get",
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async sendEmail(message: { to: string; subject: string; body: string }): Promise<void> {
    const accessToken = await this.getAccessToken();
    const config: AxiosRequestConfig = {
      method: "post",
      url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      data: {
        raw: this.createRawEmail(message)
      }
    };

    try {
      await axios(config);
      console.log(`Email sent to ${message.to}`);
    } catch (error) {
      console.error(`Error sending email to ${message.to}:`, error);
      throw error;
    }
  }

  private createRawEmail(message: { to: string; subject: string; body: string }): string {
    const emailLines = [
      `To: ${message.to}`,
      'From: me',
      `Subject: ${message.subject}`,
      '',
      message.body
    ];

    const emailContent = emailLines.join('\r\n').trim();
    const encodedMessage = Buffer.from(emailContent).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return encodedMessage;
  }
}

export default new GmailAPI();