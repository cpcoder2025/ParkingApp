import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ReverseGeocodeDto {
  @ApiProperty({ example: 37.7749, description: 'Latitude' })
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -122.4194, description: 'Longitude' })
  @Type(() => Number)
  @IsNumber()
  longitude: number;
}
