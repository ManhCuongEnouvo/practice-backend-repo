// src/modules/booking/dto/create-booking.dto.ts
import { IsString, IsDateString, IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  customerName: string;

  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  seats: number;
}
