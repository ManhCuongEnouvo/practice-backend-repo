import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class BookingEventsHandler {
  @OnEvent('booking.deleted')
  handleBookingDeleted(payload: { bookingId: number }) {
    console.log(`Booking with ID ${payload.bookingId} has been deleted.`);
    // sendEmailToUser(...);
    // logActivity(...);
  }
}
