import { ApiProperty } from '@nestjs/swagger';

export class SearchResultDto {
  @ApiProperty()
  tripId: number;

  @ApiProperty()
  operatorName: string;

  @ApiProperty()
  fromStopName: string;

  @ApiProperty()
  toStopName: string;

  @ApiProperty()
  departureAt: Date;

  @ApiProperty()
  arrivalAt: Date;

  @ApiProperty()
  fromSeq: number;

  @ApiProperty()
  toSeq: number;

  @ApiProperty()
  availableSeats: number;

  @ApiProperty()
  price: number;
}
