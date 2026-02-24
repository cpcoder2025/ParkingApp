import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, MinLength, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbySearchDto {
  @ApiPropertyOptional({
    example: 37.7749,
    description: 'Required unless "address" is provided',
  })
  @ValidateIf((o) => !o.address)
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    example: -122.4194,
    description: 'Required unless "address" is provided',
  })
  @ValidateIf((o) => !o.address)
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: '123 Main St, San Francisco',
    description: 'Search by address instead of lat/lng',
  })
  @ValidateIf((o) => o.latitude == null || o.longitude == null)
  @IsString()
  @MinLength(3)
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 1000, description: 'Radius in meters' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(100)
  radius?: number = 1000;
}
