import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - @mengo/database types will be available after Prisma client generation
import { PrismaClient, Role } from '@mengo/database';

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor(
    prismaService: PrismaService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {
    // Cast PrismaService to PrismaClient to access database methods
    // PrismaService extends PrismaClient, so this is safe
    this.prisma = prismaService as unknown as PrismaClient;
  }

  async requestOtp(email: string): Promise<{ message: string }> {
    // Upsert user
    const user = (await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    })) as { id: string };

    // Generate OTP
    const otp = this.generateNumericOtp();
    const hashedOtp = await this.hashData(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Save OTP to database
    await this.prisma.authOtp.create({
      data: {
        hashedOtp,
        expiresAt,
        userId: user.id,
      },
    });

    // Send OTP via email
    await this.mailService.sendOtp(email, otp);

    return { message: 'OTP sent' };
  }

  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      role: Role;
    };
  }> {
    // Find user with memberships
    const user = (await this.prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })) as {
      id: string;
      email: string;
      name: string | null;
      memberships: Array<{ role: Role }>;
    } | null;

    if (!user) {
      throw new UnauthorizedException('Invalid email or OTP');
    }

    // Find latest valid OTP
    const latestOtp = (await this.prisma.authOtp.findFirst({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })) as { id: string; hashedOtp: string } | null;

    if (!latestOtp) {
      throw new UnauthorizedException('OTP expired or invalid');
    }

    // Verify OTP
    const isMatch = await this.compareData(otp, latestOtp.hashedOtp);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Get user role from membership or default to STUDENT
    const role =
      user.memberships && user.memberships.length > 0
        ? user.memberships[0].role
        : ('STUDENT' as Role);

    // Generate tokens
    const tokens = this.generateTokens(user.id, role);
    const hashedRt = await this.hashData(tokens.refreshToken);

    // Update user with refresh token
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: { hashedRefreshToken: hashedRt },
    });

    // Delete used OTP
    await this.prisma.authOtp.delete({
      where: {
        id: latestOtp.id,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
      },
    };
  }

  generateTokens(
    userId: string,
    role: Role,
  ): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessTokenSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new Error(
        'JWT_ACCESS_SECRET or JWT_REFRESH_SECRET is not defined in environment variables',
      );
    }

    const accessToken = sign({ sub: userId, role }, accessTokenSecret, {
      expiresIn: '1d',
    });

    const refreshToken = sign({ sub: userId }, refreshTokenSecret, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  async compareData(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }

  generateNumericOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async logout(userId: string): Promise<{ message: string }> {
    // Check if user exists
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
    })) as { id: string } | null;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Clear refresh token from database
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: null,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async getUserInfo(userId: string): Promise<{
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    role: string;
  }> {
    // Find user with memberships
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })) as {
      id: string;
      email: string;
      name: string | null;
      memberships: Array<{ role: Role }>;
    } | null;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Get user role from membership or default to STUDENT
    const role =
      user.memberships && user.memberships.length > 0
        ? user.memberships[0].role
        : ('STUDENT' as Role);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: null, // Avatar field doesn't exist in schema yet, return null for now
      role: role as string,
    };
  }
}
