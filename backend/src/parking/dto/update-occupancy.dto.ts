import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateOccupancyDto {
  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(0)
  availableSpots: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  occupiedSpots: number;
}
