import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-of-parking-location' })
  @IsUUID()
  parkingId: string;

  @ApiProperty({ example: '2026-03-01T10:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-03-01T14:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ example: 'ABC-1234' })
  @IsOptional()
  @IsString()
  vehiclePlate?: string;
}
