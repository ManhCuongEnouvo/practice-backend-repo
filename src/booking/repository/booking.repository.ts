
import { Booking } from '../entities/booking.entities';

export class BookingRepository {
  private bookings: Booking[] = [];
  private idCounter = 1;

  create(booking: Omit<Booking, 'id'>): Booking {
    const newBooking: Booking = { id: this.idCounter++, ...booking };
    this.bookings.push(newBooking);
    return newBooking;
  }

  findAll(): Booking[] {
    return this.bookings;
  }
}
