import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './strategies/jwt.strategy';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - @mengo/database types will be available after Prisma client generation
import type { User, Role } from '@mengo/database';
import {
  RequestOtpDto,
  VerifyOtpDto,
  RequestOtpResponseDto,
  VerifyOtpResponseDto,
  LogoutResponseDto,
  UserInfoResponseDto,
} from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request OTP',
    description:
      'Send a 6-digit OTP code to the user email address. The OTP is valid for 5 minutes.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: RequestOtpResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation error - Invalid email format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['email must be an email'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to send OTP email',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Failed to send OTP email: ...' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.authService.requestOtp(requestOtpDto.email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP',
    description:
      'Verify the OTP code and receive access token and refresh token. The OTP will be deleted after successful verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    type: VerifyOtpResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation error - Invalid email or OTP format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'email must be an email',
            'otp must be longer than or equal to 6 characters',
            'otp should not be empty',
          ],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email, OTP, or OTP expired',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: {
          type: 'string',
          example: 'Invalid email or OTP',
        },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout',
    description:
      'Logout the user by clearing the refresh token from the database. Requires Bearer token authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    type: LogoutResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: {
          type: 'string',
          example: 'Unauthorized',
        },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }

  @Get('info')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get User Info',
    description:
      'Get user information (name, email, avatar, role) from the access token. Requires Bearer token authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: UserInfoResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: {
          type: 'string',
          example: 'Unauthorized',
        },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async getUserInfo(@CurrentUser() user: JwtPayload) {
    return this.authService.getUserInfo(user.sub);
  }

  // ==========================================
  // GOOGLE OAUTH ENDPOINTS (New)
  // ==========================================

  /**
   * Endpoint 1: GET /auth/google
   * This is the route the frontend will link to,
   * to start the Google login flow.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This function will not execute.
    // The 'google' AuthGuard redirects the user to Google's consent screen.
  }

  /**
   * Endpoint 2: GET /auth/google/callback
   * This is the route Google redirects back to after consent.
   * The 'google' AuthGuard activates, runs GoogleStrategy.validate(),
   * and attaches the user to req.user.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: { user: User & { memberships?: Array<{ role: Role }> } },
    @Res() res: Response,
  ) {
    // req.user is populated by the GoogleStrategy.validate() function
    const user = req.user;

    // 1. Get user role from membership or default to STUDENT
    const role =
      user.memberships && user.memberships.length > 0
        ? user.memberships[0].role
        : ('STUDENT' as Role);

    // 2. Generate our application's JWT tokens
    const tokens = this.authService.generateTokens(user.id, role);

    // 3. Save the hashed refresh token to the DB
    await this.authService.updateHashedRefreshToken(
      user.id,
      tokens.refreshToken,
    );

    // 4. Redirect the user back to the frontend application,
    // passing the tokens in the URL query parameters.
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not defined in environment variables');
    }
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }
}
