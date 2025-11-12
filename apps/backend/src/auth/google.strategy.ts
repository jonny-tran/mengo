import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - @mengo/database types will be available after Prisma client generation
import { User } from '@mengo/database';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('CALLBACK_URL_OAUTH2');

    if (!clientID || !clientSecret) {
      throw new Error(
        'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be defined in environment variables',
      );
    }

    if (!callbackURL) {
      throw new Error(
        'CALLBACK_URL_OAUTH2 must be defined in environment variables',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['profile', 'email'],
    });
  }

  /**
   * This function is called by Passport after Google successfully authenticates.
   * It provides the user's Google profile.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      emails?: Array<{ value?: string }>;
      displayName?: string;
      photos?: Array<{ value?: string }>;
    },
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const user: User = await this.authService.validateGoogleUser(profile);
      done(null, user);
    } catch (error) {
      done(error as Error, false);
    }
  }
}
