import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddPaymentMethodDto {
  @ApiProperty({ example: 'pm_xxxxxxxxxxxx', description: 'Stripe payment method ID from client' })
  @IsString()
  paymentMethodId: string;
}
