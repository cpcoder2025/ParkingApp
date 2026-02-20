import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'pi_xxxxxxxxxxxx' })
  @IsString()
  paymentIntentId: string;
}
