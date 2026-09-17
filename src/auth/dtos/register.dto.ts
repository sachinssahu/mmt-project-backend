import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user1' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'user1@x.com', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234567890' })
  @Matches(/^[1-9]\d{9}$/, {
    message: 'phone must be a valid 10-digit Indian number',
  })
  phone: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @MinLength(8)
  password: string;
}
