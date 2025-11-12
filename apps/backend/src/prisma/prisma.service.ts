import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - @mengo/database types will be available after TypeScript server recognizes the module
import { PrismaClient } from '@mengo/database';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    // Try to get DATABASE_URL from ConfigService first, then fallback to process.env
    const databaseUrl =
      configService.get<string>('DATABASE_URL') || process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL is not defined in environment variables. Please check your .env file in apps/backend/ directory.',
      );
    }

    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
