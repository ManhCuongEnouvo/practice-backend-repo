
import { Injectable } from '@nestjs/common';

export interface Booking {
  id: number;
  customerName: string;
  date: string;
  seatNumber: string;
}

@Injectable()
export class BookingRepository {
  private bookings: Booking[] = [
    { id: 1, customerName: 'John Doe', date: '2025-08-12', seatNumber: 'A1' },
    { id: 2, customerName: 'Jane Smith', date: '2025-08-13', seatNumber: 'B2' },
  ];

  // Query method: only get data, no state change
  findAll(): Booking[] {
    return this.bookings;
  }

  // Query method: get 1 booking by id
  findById(id: number): Booking | undefined {
    return this.bookings.find((b) => b.id === id);
  }
}

