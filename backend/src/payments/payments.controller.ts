import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
  AddPaymentMethodDto,
} from './dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../entities';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('methods')
  @ApiOperation({ summary: 'List saved payment methods' })
  getMethods(@CurrentUser('id') userId: string) {
    return this.paymentsService.getPaymentMethods(userId);
  }

  @Post('methods')
  @ApiOperation({ summary: 'Add new payment method' })
  addMethod(
    @Body() dto: AddPaymentMethodDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.addPaymentMethod(dto, userId);
  }

  @Post('intent')
  @ApiOperation({ summary: 'Create payment intent' })
  createIntent(
    @Body() dto: CreatePaymentIntentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.createPaymentIntent(dto, userId);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm payment' })
  confirm(@Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(dto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List invoices' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getInvoices(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.getInvoices(userId, page || 1, limit || 20);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Download invoice PDF' })
  getInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.getInvoiceById(id, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  getPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.getPaymentDetails(id, userId);
  }

  @Post(':id/refund')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Process refund' })
  refund(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.processRefund(id);
  }
}
