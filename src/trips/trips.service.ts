import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { In, LessThan, MoreThan, Repository } from 'typeorm';
import { TripStop } from './entities/trip-stop.entity';
import { Seat } from '../buses/entities/seat.entity';
import { SeatBooking } from '../bookings/entities/seat-booking.entity';
import { RouteFare } from '../routes/entities/route-fare.entity';
import { SeatMapQueryDto } from './dtos/seat-map-query.dto';
import { SeatMapResponseDto } from './dtos/seat-map-response.dto';
import { SeatBookingStatusUtil } from '../bookings/enums/seat-booking-status.enum';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip) private tripsRepository: Repository<Trip>,
    @InjectRepository(TripStop)
    private tripStopsRepository: Repository<TripStop>,
    @InjectRepository(Seat) private seatsRepository: Repository<Seat>,
    @InjectRepository(SeatBooking)
    private seatBookingsRepository: Repository<SeatBooking>,
    @InjectRepository(RouteFare)
    private routeFaresRepository: Repository<RouteFare>,
  ) {}

  async getSeatMap(
    tripId: number,
    query: SeatMapQueryDto,
  ): Promise<SeatMapResponseDto> {
    const { fromSeq, toSeq } = query;

    if (fromSeq >= toSeq) {
      throw new BadRequestException(
        `toSeq must be greater than fromSeq. Selected boarding point is actually a stop after a drop point`,
      );
    }

    // 2. does the trip exist?
    // SELECT * FROM trips WHERE id = 1 LIMIT 1;
    const trip = await this.tripsRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException(`tripId ${tripId} not found`);
    }

    // 3. are both seqs real stops on this trip?
    // SELECT * FROM trip_stops WHERE trip_id = 1  → an array of objects with all the stops
    const stops = await this.tripStopsRepository.find({ where: { tripId } });
    const seqs = stops.map((stop) => stop.seq); // extract all the found seq
    if (!seqs.includes(fromSeq) || !seqs.includes(toSeq)) {
      throw new BadRequestException(
        `Trip ${tripId} has no stop at seq ${fromSeq} or ${toSeq}. Valid seqs: ${seqs.join(', ')}`,
      );
    }

    // 4. all seats on this bus
    // SELECT * FROM seats WHERE bus_id = 1 ORDER BY deck ASC, seat_number ASC;
    const seats = await this.seatsRepository.find({
      where: { busId: trip.busId },
      order: { deck: 'ASC', seatNumber: 'ASC' },
    });

    // 5. find occupied seat ids (the In / LessThan / MoreThan query)
    // SELECT seat_id FROM seat_bookings WHERE trip_id  = 1 AND status   IN ('HELD', 'CONFIRMED')
    //   AND from_seq < 6      -- LessThan(toSeq)
    //   AND to_seq   > 3;     -- MoreThan(fromSeq)
    const occupiedSeats = await this.seatBookingsRepository.find({
      where: {
        tripId: tripId,
        status: In(SeatBookingStatusUtil.OCCUPYING),
        fromSeq: LessThan(toSeq),
        toSeq: MoreThan(fromSeq),
      },
      select: { seatId: true },
    });

    const occupiedSeatIds = new Set(
      occupiedSeats.map((seatBooked) => seatBooked.seatId),
    );

    // 6. look up the fare, multiply by trip.fareMultiplier
    // SELECT * FROM route_fares WHERE route_id = 1 AND from_seq = 3 AND to_seq = 6 LIMIT 1;
    const fare = await this.routeFaresRepository.findOne({
      where: {
        routeId: trip.routeId,
        fromSeq: fromSeq,
        toSeq: toSeq,
      },
    });
    if (!fare) {
      throw new NotFoundException(
        `Fare is not set for segment ${fromSeq} to ${toSeq}`,
      );
    }

    const price = Math.round(fare.baseFare * trip.fareMultiplier);

    // 7. map to SeatMapResponseDto, build the response NoSQL
    return {
      tripId,
      fromSeq,
      toSeq,
      seats: seats.map((seat) => ({
        seatNumber: seat.seatNumber,
        deck: seat.deck,
        seatType: seat.seatType,
        available: !occupiedSeatIds.has(seat.id),
        price,
      })),
    };
  }
}
