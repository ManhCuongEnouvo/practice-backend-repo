
import { Injectable } from '@nestjs/common';
import { BookingDto } from '../dto/booking.dto';

export interface Booking {
  id: number;
  customerName: string;
  date: string;
  seatNumber: string;
}

@Injectable()
export class BookingRepository {
  private bookings: BookingDto[] = [
    { id: 1, customerName: 'Alice', date: '2025-08-15', seatNumber: 'A1' },
    { id: 2, customerName: 'Bob', date: '2025-08-16', seatNumber: 'B2' },
  ];

  // Query method
  findAll(): BookingDto[] {
    return [...this.bookings];
  }

  // Query method
  findById(id: number): BookingDto | undefined {
    return this.bookings.find(b => b.id === id);
  }

  // 6.3_Avoid query methods that expose internal state
  async find(): Promise<any[]> {
    return this.bookings.map(item => ({
      ...item,
    }));
  }
}



