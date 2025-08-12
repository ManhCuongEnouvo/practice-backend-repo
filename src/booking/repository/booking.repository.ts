
import { Injectable } from '@nestjs/common';
import { BookingDto } from '../dto/booking.dto';
import { BookingReportReadModel } from '../dto/booking-report.dto';

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

  // 6.4 Define methods and return types clearly
  async findByUserId(userId: number) {
    return this.bookings.filter(b => b.id === userId);
  }

  // Command method — change data
  async deleteById(id: number) {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx !== -1) this.bookings.splice(idx, 1);
  }

  async save(booking: Booking): Promise<Booking> {
    this.bookings.push(booking);
    return booking;
  }

 async getReportByDate(date: string): Promise<BookingReportReadModel> {
  const filtered = this.bookings.filter(b => b.date === date);
  const totalTicketsSold = filtered.length;
  const totalRevenue = filtered.reduce((sum, b) => sum + (b.price ?? 0), 0);
  return {
    date,
    totalTicketsSold,
    totalRevenue,
  };
}

}



