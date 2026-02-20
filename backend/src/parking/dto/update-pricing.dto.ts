import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePricingDto {
  @ApiProperty({ example: 5.0 })
  @IsNumber()
  @Min(0)
  priceHourly: number;

  @ApiPropertyOptional({ example: 25.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceDaily?: number;
}
