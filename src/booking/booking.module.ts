import { Module } from '@nestjs/common';
import { BookingService } from './service/booking.service';
import { BookingController } from './controller/booking.controller';
import { BookingRepository } from './repository/booking.repository';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CqrsModule } from '@nestjs/cqrs';
import { BOOKING_TIMEOUT } from './constans';

@Module({
  imports:[EventEmitterModule.forRoot(), CqrsModule],
  providers: [{
      provide: BOOKING_TIMEOUT,
      useValue: 30000,
    }, BookingService, BookingRepository],
  controllers: [BookingController]
})
export class BookingModule {}
