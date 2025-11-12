import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '6-digit OTP code received via email',
    example: '123456',
    type: String,
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  otp: string;
}
