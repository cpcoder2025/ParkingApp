import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ExtendBookingDto {
  @ApiProperty({ example: '2026-03-01T18:00:00Z' })
  @IsDateString()
  newEndTime: string;
}
