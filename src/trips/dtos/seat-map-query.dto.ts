import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class SeatMapQueryDto {
  @ApiProperty({
    example: 0,
    description: 'trip_stops.seq of the boarding point',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  fromSeq: number;

  @ApiProperty({ example: 3, description: 'trip_stops.seq of the drop point' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  toSeq: number;
  // DTO can't check: that toSeq > fromSeq, DTO treats each decorator as one feild. So we will check toSeq > fromSeq in service
}
