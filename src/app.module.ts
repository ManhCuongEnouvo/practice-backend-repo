import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingModule } from './booking/booking.module';
import { BookingController } from './booking/controller/booking.controller';
import { BookingService } from './booking/service/booking.service';
import { BookingRepository } from './booking/repository/booking.repository';

@Module({
  imports: [BookingModule],
  controllers: [AppController, BookingController ],
  providers: [AppService, BookingService, BookingRepository],
})
export class AppModule {}
