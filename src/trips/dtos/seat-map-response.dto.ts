import { ApiProperty } from '@nestjs/swagger';
import { DeckType } from '../../buses/enums/deck-type.enum';
import { SeatType } from '../../buses/enums/seat-type.enum';

export class SeatDto {
  @ApiProperty({ example: 'L1' })
  seatNumber: string;

  @ApiProperty({ enum: DeckType, example: DeckType.LOWER })
  deck: DeckType;

  @ApiProperty({ enum: SeatType })
  seatType: SeatType;

  @ApiProperty({ example: true })
  available: boolean;

  @ApiProperty({ example: 555 })
  price: number;
}

export class SeatMapResponseDto {
  // In Response DTOs we never check datatypes we just describe the shape we will return
  @ApiProperty({ example: 1 })
  tripId: number;

  @ApiProperty({
    example: 0,
    description: 'boarding point of trip',
    minimum: 0,
  })
  fromSeq: number;

  @ApiProperty({
    example: 1,
    description: 'drop point of trip and Is always greater than fromSeq',
    minimum: 1,
  })
  toSeq: number;

  @ApiProperty({
    type: [SeatDto],
    example: [
      {
        seatNumber: 'L1',
        deck: 'LOWER',
        seatType: 'SLEEPER',
        available: true,
        price: 555,
      },
    ],
  })
  seats: SeatDto[];
}
