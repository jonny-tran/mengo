import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined in environment variables');
    }
    this.resend = new Resend(apiKey);
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: 'Mengo <onboarding@resend.dev>',
        to: email,
        subject: 'Your Mengo Login Code',
        html: `
          <div>
            <h2>Your Mengo Login Code</h2>
            <p>Your login code is: <strong>${otp}</strong></p>
            <p>This code will expire in 5 minutes.</p>
          </div>
        `,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send OTP email: ${errorMessage}`);
    }
  }
}
