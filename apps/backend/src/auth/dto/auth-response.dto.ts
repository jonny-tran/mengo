import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'OTP sent',
  })
  message: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: 'User role',
    example: 'STUDENT',
    enum: ['STUDENT', 'INSTRUCTOR'],
  })
  role: string;
}

export class VerifyOtpResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}
