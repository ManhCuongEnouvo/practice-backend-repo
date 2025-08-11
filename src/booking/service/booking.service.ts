import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingRepository, Booking } from '../repository/booking.repository';
import { BookingDto } from '../dto/booking.dto';

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
}
