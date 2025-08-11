import { Module } from '@nestjs/common';
import { BookingService } from './service/booking.service';
import { BookingController } from './controller/booking.controller';
import { BookingRepository } from './repository/booking.repository';

@Module({
  providers: [BookingService, BookingRepository],
  controllers: [BookingController]
})
export class BookingModule {}
