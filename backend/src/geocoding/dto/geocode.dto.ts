import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class GeocodeDto {
  @ApiProperty({
    example: '123 Main St, San Francisco, CA',
    description: 'Address to convert to coordinates',
  })
  @IsString()
  @MinLength(3)
  address: string;
}
