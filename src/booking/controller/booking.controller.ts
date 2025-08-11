import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BookingService } from '../service/booking.service';
import { Booking } from '../repository/booking.repository';
import { BookingDto } from '../dto/booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  getAll(): BookingDto[] {
    return this.bookingService.getAllBookings();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): BookingDto {
    return this.bookingService.getBookingById(id);
  }

//6.3_Avoid query methods that expose internal state
  @Get()
  async getBookings(): Promise<BookingDto[]> {
  return this.bookingService.findAll();
  }
}
