import { ApiProperty } from '@nestjs/swagger';

export class UserInfoResponseDto {
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
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar: string | null;

  @ApiProperty({
    description: 'User role',
    example: 'STUDENT',
    enum: ['STUDENT', 'INSTRUCTOR'],
  })
  role: string;
}

