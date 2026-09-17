import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripStop } from '../trips/entities/trip-stop.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Seat } from '../buses/entities/seat.entity';
import { SeatBooking } from '../bookings/entities/seat-booking.entity';
import { RouteFare } from '../routes/entities/route-fare.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripStop, Trip, Seat, SeatBooking, RouteFare]),
  ],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
