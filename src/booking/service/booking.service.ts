import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingRepository, Booking } from '../repository/booking.repository';
import { BookingDto } from '../dto/booking.dto';
import { BookingSummary } from '../dto/booking-summary.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingReportReadModel } from '../dto/booking-report.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

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

  // Query method
  async getBookingsForUserQuery(userId: number) {
    // ✅ Call (findByUserId), Not call delete/update
    const entities = await this.bookingRepo.findByUserId(userId);
    return entities.map(e => ({
      date: e.date,
      seatNumber: e.seatNumber,
    }));
  }

   // ✅ Command method
  async deleteBooking(bookingId: number) {
    return this.bookingRepo.deleteById(bookingId);
  }

  // 7.2_Limit the scope of a command method, and use events to perform secondary tasks
 async deleteBookingEvent(bookingId: number): Promise<boolean> {
    const deleted = this.bookingRepo.deleteById(bookingId);

    if(!deleted) {
      return false
    }

    this.eventEmitter.emit('booking.deleted', { bookingId });
    return true
  }

  // 7.4. When something goes wrong, throw an exception
 async createBooking(customerName: string, date: string, seatNumber: string): Promise<Booking> {
  if (!customerName || customerName.trim() === '') {
    throw new BadRequestException('Customer name is required');
  }

  if (!date || isNaN(Date.parse(date))) {
    throw new BadRequestException('Invalid date format');
  }

  if (!seatNumber || seatNumber.trim() === '') {
    throw new BadRequestException('Seat number is required');
  }

  const booking: Booking = {
    id: Date.now(), // mock ID
    customerName: customerName.trim(),
    date: date.trim(),
    seatNumber: seatNumber.trim(),
  };

  try {
    return await this.bookingRepo.save(booking);
  } catch (error) {
    throw new Error('Failed to save booking: ' + error.message);
  }
}

    // QUERY: report by date
  async getReportByDate(date: string): Promise<BookingReportReadModel> {
    return this.bookingRepo.getReportByDate(date);
  }
}
