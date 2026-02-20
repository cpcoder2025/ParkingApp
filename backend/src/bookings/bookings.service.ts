/*
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Not, In } from 'typeorm';
import { randomUUID } from 'crypto';
import * as QRCode from 'qrcode';
import {
  Booking,
  BookingStatus,
  ParkingLocation,
  Occupancy,
  UserRole,
} from '../entities';
import {
  CreateBookingDto,
  UpdateBookingDto,
  ExtendBookingDto,
  CheckAvailabilityDto,
} from './dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
    @InjectRepository(ParkingLocation)
    private parkingRepo: Repository<ParkingLocation>,
    @InjectRepository(Occupancy)
    private occupancyRepo: Repository<Occupancy>,
  ) {}

  async findAllForUser(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.bookingsRepo.findAndCount({
      where: { userId },
      relations: ['parking'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit };
  }

  async create(dto: CreateBookingDto, userId: string) {
    const parking = await this.parkingRepo.findOne({
      where: { id: dto.parkingId },
    });
    if (!parking) throw new NotFoundException('Parking location not found');

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    const available = await this.checkSlotAvailability(
      dto.parkingId,
      start,
      end,
    );
    if (!available) {
      throw new BadRequestException('No spots available for this time slot');
    }

    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalPrice = Number((hours * Number(parking.priceHourly)).toFixed(2));

    const qrCode = randomUUID();
    const booking = this.bookingsRepo.create({
      userId,
      parkingId: dto.parkingId,
      startTime: start,
      endTime: end,
      vehiclePlate: dto.vehiclePlate,
      totalPrice,
      qrCode,
      status: BookingStatus.PENDING,
    });

    const saved = await this.bookingsRepo.save(booking);

    await this.occupancyRepo
      .createQueryBuilder()
      .update(Occupancy)
      .set({
        reservedSpots: () => 'reserved_spots + 1',
        availableSpots: () => 'available_spots - 1',
      })
      .where('parking_id = :parkingId', { parkingId: dto.parkingId })
      .execute();

    return saved;
  }

  async findOne(id: string, userId: string) {
    const booking = await this.bookingsRepo.findOne({
      where: { id },
      relations: ['parking', 'payment'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new ForbiddenException('Not authorized to view this booking');
    }
    return booking;
  }

  async update(id: string, dto: UpdateBookingDto, userId: string) {
    const booking = await this.findOne(id, userId);
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be updated');
    }

    if (dto.startTime) booking.startTime = new Date(dto.startTime);
    if (dto.endTime) booking.endTime = new Date(dto.endTime);
    if (dto.vehiclePlate) booking.vehiclePlate = dto.vehiclePlate;

    if (dto.startTime || dto.endTime) {
      const hours =
        (booking.endTime.getTime() - booking.startTime.getTime()) /
        (1000 * 60 * 60);
      const parking = await this.parkingRepo.findOne({
        where: { id: booking.parkingId },
      });
      if (!parking) throw new NotFoundException('Parking location not found');
      booking.totalPrice = Number(
        (hours * Number(parking.priceHourly)).toFixed(2),
      );
    }

    return this.bookingsRepo.save(booking);
  }

  async cancel(id: string, userId: string) {
    const booking = await this.findOne(id, userId);
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    await this.bookingsRepo.save(booking);

    await this.occupancyRepo
      .createQueryBuilder()
      .update(Occupancy)
      .set({
        reservedSpots: () => 'GREATEST(reserved_spots - 1, 0)',
        availableSpots: () => 'available_spots + 1',
      })
      .where('parking_id = :parkingId', { parkingId: booking.parkingId })
      .execute();

    return { message: 'Booking cancelled successfully' };
  }

  async getQrCode(id: string, userId: string) {
    const booking = await this.findOne(id, userId);
    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify({
        bookingId: booking.id,
        qrCode: booking.qrCode,
        parking: booking.parkingId,
        start: booking.startTime,
        end: booking.endTime,
      }),
    );
    return { qrCode: booking.qrCode, qrDataUrl };
  }

  async verifyQrCode(id: string, qrCode: string) {
    const booking = await this.bookingsRepo.findOne({
      where: { id },
      relations: ['parking'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.qrCode !== qrCode) {
      throw new BadRequestException('Invalid QR code');
    }

    if (booking.status === BookingStatus.PENDING) {
      booking.status = BookingStatus.ACTIVE;
      await this.occupancyRepo
        .createQueryBuilder()
        .update(Occupancy)
        .set({
          reservedSpots: () => 'GREATEST(reserved_spots - 1, 0)',
          occupiedSpots: () => 'occupied_spots + 1',
          lastEntryAt: new Date(),
        })
        .where('parking_id = :parkingId', { parkingId: booking.parkingId })
        .execute();
    } else if (booking.status === BookingStatus.ACTIVE) {
      booking.status = BookingStatus.COMPLETED;
      await this.occupancyRepo
        .createQueryBuilder()
        .update(Occupancy)
        .set({
          occupiedSpots: () => 'GREATEST(occupied_spots - 1, 0)',
          availableSpots: () => 'available_spots + 1',
          lastExitAt: new Date(),
        })
        .where('parking_id = :parkingId', { parkingId: booking.parkingId })
        .execute();
    }

    await this.bookingsRepo.save(booking);
    return { status: booking.status, message: `Booking is now ${booking.status}` };
  }

  async extend(id: string, dto: ExtendBookingDto, userId: string) {
    const booking = await this.findOne(id, userId);
    if (
      booking.status !== BookingStatus.ACTIVE &&
      booking.status !== BookingStatus.PENDING
    ) {
      throw new BadRequestException('Only active/pending bookings can be extended');
    }

    const newEnd = new Date(dto.newEndTime);
    if (newEnd <= booking.endTime) {
      throw new BadRequestException('New end time must be after current end time');
    }

    const parking = await this.parkingRepo.findOne({
      where: { id: booking.parkingId },
    });
    if (!parking) throw new NotFoundException('Parking location not found');
    const hours =
      (newEnd.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60);
    booking.endTime = newEnd;
    booking.totalPrice = Number(
      (hours * Number(parking.priceHourly)).toFixed(2),
    );

    return this.bookingsRepo.save(booking);
  }

  async checkAvailability(dto: CheckAvailabilityDto) {
    const parking = await this.parkingRepo.findOne({
      where: { id: dto.parkingId },
    });
    if (!parking) throw new NotFoundException('Parking location not found');

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    const available = await this.checkSlotAvailability(
      dto.parkingId,
      start,
      end,
    );

    const occupancy = await this.occupancyRepo.findOne({
      where: { parkingId: dto.parkingId },
    });

    return {
      available,
      totalCapacity: parking.totalCapacity,
      currentAvailable: occupancy?.availableSpots ?? parking.totalCapacity,
      priceHourly: parking.priceHourly,
    };
  }

  async getHistory(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.bookingsRepo.findAndCount({
      where: {
        userId,
        status: In([BookingStatus.COMPLETED, BookingStatus.CANCELLED]),
      },
      relations: ['parking', 'payment'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit };
  }

  private async checkSlotAvailability(
    parkingId: string,
    start: Date,
    end: Date,
  ): Promise<boolean> {
    const parking = await this.parkingRepo.findOne({
      where: { id: parkingId },
    });
    if (!parking) return false;

    const overlapping = await this.bookingsRepo.count({
      where: {
        parkingId,
        status: In([BookingStatus.PENDING, BookingStatus.ACTIVE]),
        startTime: LessThan(end),
        endTime: MoreThan(start),
      },
    });

    return overlapping < parking.totalCapacity;
  }
}
*/
