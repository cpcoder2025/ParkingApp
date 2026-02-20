import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbySearchDto {
  @ApiProperty({ example: 37.7749 })
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -122.4194 })
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 1000, description: 'Radius in meters' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(100)
  radius?: number = 1000;
}
