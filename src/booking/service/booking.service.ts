import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingRepository, Booking } from '../repository/booking.repository';

@Injectable()
export class BookingService {
  constructor(private readonly bookingsRepo: BookingRepository) {}

  // Query method: Get All booking
  getAllBookings(): Booking[] {
    // (2) Process
    const bookings = this.bookingsRepo.findAll();
    // (3) Return
    return bookings;
  }

  // Query method: get booking by id
  getBookingById(id: number): Booking {
    // (1) Check input
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid booking ID');
    }
    // (2) Process
    const booking = this.bookingsRepo.findById(id);
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    // (3) Return
    return booking;
  }
}
