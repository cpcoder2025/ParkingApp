import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckAvailabilityDto {
  @ApiProperty({ example: 'uuid-of-parking-location' })
  @IsUUID()
  parkingId: string;

  @ApiProperty({ example: '2026-03-01T10:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-03-01T14:00:00Z' })
  @IsDateString()
  endTime: string;
}
