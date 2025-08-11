// src/modules/booking/booking.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { BookingRepository } from '../repository/booking.repository';
import { CreateBookingDto } from '../dto/booking.dto';
import { Booking } from '../entities/booking.entities';

@Injectable()
export class BookingService {
  constructor(private readonly bookingRepo: BookingRepository) {}

  createBooking(dto: CreateBookingDto): Booking {
    // 1. Check input
    if (!dto.customerName || !dto.date || dto.seats < 1) {
      throw new BadRequestException('Invalid booking data');
    }

    // 2. Xử lý logic
    const booking: Omit<Booking, 'id'> = {
      customerName: dto.customerName,
      date: new Date(dto.date),
      seats: dto.seats,
    };

    // 3. Return kết quả
    return this.bookingRepo.create(booking);
  }

  getAllBookings(): Booking[] {
    return this.bookingRepo.findAll();
  }
}
