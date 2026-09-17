import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TripStop } from '../trips/entities/trip-stop.entity';
import { Between, In, LessThan, MoreThan, Repository } from 'typeorm';
import { SearchQueryDto } from './dtos/search-query.dto';
import { SearchResultDto } from './dtos/search-response.dto';
import { Trip } from '../trips/entities/trip.entity';
import { Seat } from '../buses/entities/seat.entity';
import { SeatBooking } from '../bookings/entities/seat-booking.entity';
import { RouteFare } from '../routes/entities/route-fare.entity';
import { SeatBookingStatusUtil } from '../bookings/enums/seat-booking-status.enum';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(TripStop)
    private readonly tripStopsRepository: Repository<TripStop>,
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(Seat)
    private readonly seatsRepository: Repository<Seat>,
    @InjectRepository(SeatBooking)
    private readonly seatBookingsRepository: Repository<SeatBooking>,
    @InjectRepository(RouteFare)
    private readonly routefaresRepository: Repository<RouteFare>,
  ) {}

  async search(query: SearchQueryDto): Promise<SearchResultDto[]> {
    const { fromCityId, toCityId, date } = query;

    //Date in IST form
    const dayStart = new Date(`${date}T00:00:00+05:30`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    // 1. stops in the from-city that a bus leaves from on that date
    const boardingStops = await this.tripStopsRepository.find({
      where: {
        stop: { cityId: fromCityId },
        departureAt: Between(dayStart, dayEnd),
        isSkipped: false,
      },
      relations: { stop: true },
    });

    if (boardingStops.length === 0) {
      return [];
    }

    // 2. which trips those belong to
    const tripIds = boardingStops.map((stop) => stop.tripId);

    const trips = await this.tripsRepository.find({
      where: { id: In(tripIds) },
      relations: { route: { operator: true } },
    });
    const tripById = new Map(trips.map((trip) => [trip.id, trip]));

    // 3. stops in the to-city on those same trips
    const dropStops = await this.tripStopsRepository.find({
      where: {
        tripId: In(tripIds),
        stop: { cityId: toCityId },
        isSkipped: false,
      },
      relations: { stop: true },
    });

    // 4. match: same trip, and the destination comes later in the route
    const results: SearchResultDto[] = [];

    for (const boardingStop of boardingStops) {
      const dropStop = dropStops.find(
        (stop) =>
          stop.tripId === boardingStop.tripId && stop.seq > boardingStop.seq,
      );
      if (!dropStop) {
        continue;
      }

      const trip = tripById.get(boardingStop.tripId);
      if (!trip) {
        continue;
      }

      // price for this segment
      const fare = await this.routefaresRepository.findOne({
        where: {
          routeId: trip.routeId,
          fromSeq: boardingStop.seq,
          toSeq: dropStop.seq,
        },
      });
      const price = fare ? Math.round(fare.baseFare * trip.fareMultiplier) : 0;

      // free seats over this span
      const totalSeats = await this.seatsRepository.count({
        where: { busId: trip.busId },
      });

      const occupied = await this.seatBookingsRepository.find({
        where: {
          tripId: trip.id,
          status: In(SeatBookingStatusUtil.OCCUPYING),
          fromSeq: LessThan(dropStop.seq),
          toSeq: MoreThan(boardingStop.seq),
        },
        select: { seatId: true },
      });
      const occupiedCount = new Set(occupied.map((sb) => sb.seatId)).size;

      results.push({
        tripId: boardingStop.tripId,
        fromStopName: boardingStop.stop.name,
        toStopName: dropStop.stop.name,
        departureAt: boardingStop.departureAt!,
        arrivalAt: dropStop.arrivalAt!,
        fromSeq: boardingStop.seq,
        toSeq: dropStop.seq,
        operatorName: trip.route.operator.name,
        availableSeats: totalSeats - occupiedCount,
        price,
      });
    }
    return results;
  }
}
