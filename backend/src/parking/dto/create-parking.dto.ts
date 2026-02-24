import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateParkingDto {
  @ApiProperty({ example: 'Downtown Parking Garage' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123 Main St, City' })
  @IsString()
  address: string;

  @ApiPropertyOptional({
    example: 37.7749,
    description: 'Auto-resolved from address if omitted',
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    example: -122.4194,
    description: 'Auto-resolved from address if omitted',
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  totalCapacity: number;

  @ApiProperty({ example: 5.0 })
  @IsNumber()
  @Min(0)
  priceHourly: number;

  @ApiPropertyOptional({ example: 25.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceDaily?: number;

  @ApiPropertyOptional({ example: ['EV Charging', 'Covered', 'Security'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
