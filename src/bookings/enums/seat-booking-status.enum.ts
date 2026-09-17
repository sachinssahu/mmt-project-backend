export enum SeatBookingStatus {
  HELD = 'HELD',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export class SeatBookingStatusUtil {
  // Status that make a seat booking unavailable over an overlapping span
  static readonly OCCUPYING = [
    SeatBookingStatus.HELD,
    SeatBookingStatus.CONFIRMED,
  ];
  static occupiesInventory(status: SeatBookingStatus) {
    return SeatBookingStatusUtil.OCCUPYING.includes(status);
  }
}
