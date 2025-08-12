import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { DashboardReadRepo } from '../repository/booking-dashboard.repository';

@Injectable()
export class BookingEventsHandler {
  @OnEvent('booking.deleted')
  handleBookingDeleted(payload: { bookingId: number }) {
    console.log(`Booking with ID ${payload.bookingId} has been deleted.`);
    // sendEmailToUser(...);
    // logActivity(...);
  }
}

export class BookingCreatedEvent {
  constructor(
    public readonly bookingId: number,
    public readonly customerName: string,
    public readonly date: string,
    public readonly seatNumber: string,
    public readonly price: number,
  ) {}
}

@Injectable()
@EventsHandler(BookingCreatedEvent)
export class BookingCreatedHandler implements IEventHandler<BookingCreatedEvent> {
  constructor(private readonly dashboardRepo: DashboardReadRepo) {}

  async handle(event: BookingCreatedEvent) {
    // Cập nhật dashboard read model (ví dụ: tổng doanh thu, tổng vé bán)
    await this.dashboardRepo.incrementTicketsSold(1);
    await this.dashboardRepo.incrementRevenue(event.price);
  }
}

