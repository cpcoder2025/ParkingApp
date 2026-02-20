/*
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  Payment,
  PaymentTransactionStatus,
  Booking,
  BookingStatus,
  PaymentStatus,
} from '../entities';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
  AddPaymentMethodDto,
} from './dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(Booking) private bookingsRepo: Repository<Booking>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
    );
  }

  async getPaymentMethods(userId: string) {
    const payments = await this.paymentsRepo
      .createQueryBuilder('p')
      .innerJoin('p.booking', 'b')
      .where('b.user_id = :userId', { userId })
      .andWhere('p.payment_method IS NOT NULL')
      .select('DISTINCT p.payment_method')
      .getRawMany();

    return payments;
  }

  async addPaymentMethod(dto: AddPaymentMethodDto, userId: string) {
    try {
      const method = await this.stripe.paymentMethods.retrieve(
        dto.paymentMethodId,
      );
      return {
        id: method.id,
        type: method.type,
        card: method.card
          ? { brand: method.card.brand, last4: method.card.last4 }
          : null,
      };
    } catch {
      throw new BadRequestException('Invalid payment method');
    }
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto, userId: string) {
    const booking = await this.bookingsRepo.findOne({
      where: { id: dto.bookingId, userId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Booking already paid');
    }

    const amountInCents = Math.round(Number(booking.totalPrice) * 100);

    let paymentIntent;
    try {
      paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: { bookingId: booking.id, userId },
      });
    } catch (err) {
      throw new BadRequestException(
        'Payment service unavailable. Please configure Stripe API keys.',
      );
    }

    const payment = this.paymentsRepo.create({
      bookingId: booking.id,
      amount: booking.totalPrice,
      currency: 'USD',
      status: PaymentTransactionStatus.PENDING,
      stripePaymentIntentId: paymentIntent.id,
    });
    await this.paymentsRepo.save(payment);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: booking.totalPrice,
    };
  }

  async confirmPayment(dto: ConfirmPaymentDto) {
    const payment = await this.paymentsRepo.findOne({
      where: { stripePaymentIntentId: dto.paymentIntentId },
      relations: ['booking'],
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const intent = await this.stripe.paymentIntents.retrieve(
      dto.paymentIntentId,
    );

    if (intent.status === 'succeeded') {
      payment.status = PaymentTransactionStatus.SUCCEEDED;
      payment.stripeChargeId = intent.latest_charge as string;
      payment.paymentMethod = intent.payment_method_types?.[0] || 'card';
      payment.receiptUrl =
        (intent as any).charges?.data?.[0]?.receipt_url || null;
      await this.paymentsRepo.save(payment);

      await this.bookingsRepo.update(payment.bookingId, {
        paymentStatus: PaymentStatus.PAID,
      });

      return { status: 'succeeded', payment };
    }

    payment.status = PaymentTransactionStatus.FAILED;
    await this.paymentsRepo.save(payment);
    return { status: intent.status, payment };
  }

  async getPaymentDetails(id: string, userId: string) {
    const payment = await this.paymentsRepo.findOne({
      where: { id },
      relations: ['booking'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.booking.userId !== userId) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async processRefund(paymentId: string) {
    const payment = await this.paymentsRepo.findOne({
      where: { id: paymentId },
      relations: ['booking'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentTransactionStatus.SUCCEEDED) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });

    payment.status = PaymentTransactionStatus.REFUNDED;
    payment.refundAmount = payment.amount;
    await this.paymentsRepo.save(payment);

    await this.bookingsRepo.update(payment.bookingId, {
      paymentStatus: PaymentStatus.REFUNDED,
      status: BookingStatus.CANCELLED,
    });

    return { refundId: refund.id, status: 'refunded', amount: payment.amount };
  }

  async getInvoices(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.paymentsRepo.findAndCount({
      where: {
        status: PaymentTransactionStatus.SUCCEEDED,
        booking: { userId },
      },
      relations: ['booking', 'booking.parking'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit };
  }

  async getInvoiceById(invoiceId: string, userId: string) {
    const payment = await this.paymentsRepo.findOne({
      where: { id: invoiceId },
      relations: ['booking', 'booking.parking', 'booking.user'],
    });
    if (!payment) throw new NotFoundException('Invoice not found');
    if (payment.booking.userId !== userId) {
      throw new NotFoundException('Invoice not found');
    }

    return {
      invoiceId: payment.id,
      date: payment.createdAt,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      receiptUrl: payment.receiptUrl,
      booking: {
        id: payment.booking.id,
        startTime: payment.booking.startTime,
        endTime: payment.booking.endTime,
        vehiclePlate: payment.booking.vehiclePlate,
      },
      parking: {
        name: payment.booking.parking.name,
        address: payment.booking.parking.address,
      },
    };
  }
}
*/
