import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
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
  constructor(private authService: AuthService) {}

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
}
