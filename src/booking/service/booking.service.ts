import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingRepository, Booking } from '../repository/booking.repository';
import { BookingDto } from '../dto/booking.dto';
import { BookingSummary } from '../dto/booking-summary.dto';

@Injectable()
export class BookingService {
  constructor(private readonly bookingRepo: BookingRepository) {}

  // Query: lấy tất cả booking
  getAllBookings(): BookingDto[] {
    return this.bookingRepo.findAll();
  }

  // Query: lấy 1 booking theo id
  getBookingById(id: number): BookingDto {
    const booking = this.bookingRepo.findById(id);
    if (!booking) {
      throw new Error(`Booking with id ${id} not found`);
    }
    return booking;
  }

  // 6.3_Avoid query methods that expose internal state
  async findAll(): Promise<BookingDto[]> {
  const entities = await this.bookingRepo.find();
  return entities.map(e => ({
    id: e.id,
    customerName: e.customerName,
    date: e.date,
    seatNumber: e.seatNumber,
  }));
}

/**
  * 6.4. Define methods and return types clearly
  * Clear method: get booking summary for a user.
  * Returns Promise<BookingSummary[]>, not raw entity.
*/
  async getBookingsForUser(userId: number): Promise<BookingSummary[]> {
    const entities = await this.bookingRepo.findByUserId(userId);

    // 6.3 — Filter out internal state + 6.4 — Return specific type
    return entities.map(e => ({
      date: e.date,
      seatNumber: e.seatNumber,
    }));
  }
}
