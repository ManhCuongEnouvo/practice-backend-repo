import { Module } from '@nestjs/common';
import { BookingService } from './service/booking.service';
import { BookingController } from './controller/booking.controller';
import { BookingRepository } from './repository/booking.repository';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports:[EventEmitterModule.forRoot()],
  providers: [BookingService, BookingRepository],
  controllers: [BookingController]
})
export class BookingModule {}
