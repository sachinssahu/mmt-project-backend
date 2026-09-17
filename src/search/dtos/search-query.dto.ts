import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  fromCityId: number;

  @ApiProperty({ example: 7 })
  @Type(() => Number)
  @IsInt()
  toCityId: number;

  @ApiProperty({ example: '2026-10-01' })
  @IsDateString()
  date: string;
}
