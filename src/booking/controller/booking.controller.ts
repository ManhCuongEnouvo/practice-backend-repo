import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BookingService } from '../service/booking.service';
import { Booking } from '../repository/booking.repository';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingsService: BookingService) {}

  @Get()
  getAll(): Booking[] {
    return this.bookingsService.getAllBookings();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Booking {
    return this.bookingsService.getBookingById(id);
  }
}
