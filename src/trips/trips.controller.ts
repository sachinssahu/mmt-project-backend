import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { Public } from '../common/decorators/public.decorator';
import { SeatMapResponseDto } from './dtos/seat-map-response.dto';
import { SeatMapQueryDto } from './dtos/seat-map-query.dto';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripService: TripsService) {}

  @Public()
  @ApiOkResponse({ type: SeatMapResponseDto })
  @Get('/:id/seats')
  getSeatMap(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: SeatMapQueryDto,
  ): Promise<SeatMapQueryDto> {
    return this.tripService.getSeatMap(id, query);
  }
}
