import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripStop } from './entities/trip-stop.entity';
import { Seat } from '../buses/entities/seat.entity';
import { SeatBooking } from '../bookings/entities/seat-booking.entity';
import { RouteFare } from '../routes/entities/route-fare.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, TripStop, Seat, SeatBooking, RouteFare]),
  ],

  providers: [TripsService],
  controllers: [TripsController],
})
export class TripsModule {}
