import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingLocation, Occupancy, UserRole } from '../entities';
import {
  CreateParkingDto,
  UpdateParkingDto,
  NearbySearchDto,
  UpdateOccupancyDto,
  UpdatePricingDto,
} from './dto';
import { GeocodingService } from '../geocoding/geocoding.service';

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(ParkingLocation)
    private parkingRepo: Repository<ParkingLocation>,
    @InjectRepository(Occupancy)
    private occupancyRepo: Repository<Occupancy>,
    private geocodingService: GeocodingService,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [items, total] = await this.parkingRepo.findAndCount({
      where: { isActive: true },
      relations: ['occupancy'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit };
  }

  async create(dto: CreateParkingDto, ownerId: string) {
    if (dto.latitude == null || dto.longitude == null) {
      const geo = await this.geocodingService.geocode(dto.address);
      dto.latitude = geo.latitude;
      dto.longitude = geo.longitude;
    }

    const parking = this.parkingRepo.create({ ...dto, ownerId });
    const saved = await this.parkingRepo.save(parking);

    const occupancy = this.occupancyRepo.create({
      parkingId: saved.id,
      availableSpots: saved.totalCapacity,
      occupiedSpots: 0,
      reservedSpots: 0,
    });
    await this.occupancyRepo.save(occupancy);

    return this.findOne(saved.id);
  }

  async findOne(id: string) {
    const parking = await this.parkingRepo.findOne({
      where: { id },
      relations: ['occupancy', 'owner'],
    });
    if (!parking) throw new NotFoundException('Parking location not found');
    if (parking.owner) {
      const { passwordHash, refreshToken, ...safeOwner } = parking.owner;
      parking.owner = safeOwner as any;
    }
    return parking;
  }

  async update(
    id: string,
    dto: UpdateParkingDto,
    userId: string,
    userRole: UserRole,
  ) {
    const parking = await this.findOne(id);
    if (userRole !== UserRole.ADMIN && parking.ownerId !== userId) {
      throw new ForbiddenException('Not authorized to update this location');
    }
    Object.assign(parking, dto);
    return this.parkingRepo.save(parking);
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const parking = await this.findOne(id);
    if (userRole !== UserRole.ADMIN && parking.ownerId !== userId) {
      throw new ForbiddenException('Not authorized to delete this location');
    }
    if (parking.occupancy) {
      await this.occupancyRepo.remove(parking.occupancy);
    }
    await this.parkingRepo.remove(parking);
    return { message: 'Parking location deleted' };
  }

  async findNearby(dto: NearbySearchDto) {
    let { latitude, longitude } = dto;

    if ((latitude == null || longitude == null) && dto.address) {
      const geo = await this.geocodingService.geocode(dto.address);
      latitude = geo.latitude;
      longitude = geo.longitude;
    }

    if (latitude == null || longitude == null) {
      throw new BadRequestException(
        'Provide either latitude/longitude or an address',
      );
    }

    const radiusInDegrees = (dto.radius || 1000) / 111320;

    const parkings = await this.parkingRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.occupancy', 'o')
      .where('p.is_active = :active', { active: true })
      .andWhere('p.latitude BETWEEN :minLat AND :maxLat', {
        minLat: latitude - radiusInDegrees,
        maxLat: latitude + radiusInDegrees,
      })
      .andWhere('p.longitude BETWEEN :minLng AND :maxLng', {
        minLng: longitude - radiusInDegrees,
        maxLng: longitude + radiusInDegrees,
      })
      .getMany();

    return parkings
      .map((p) => ({
        ...p,
        distance: this.haversineDistance(
          latitude!,
          longitude!,
          Number(p.latitude),
          Number(p.longitude),
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  async getOccupancy(parkingId: string) {
    const occupancy = await this.occupancyRepo.findOne({
      where: { parkingId },
    });
    if (!occupancy) throw new NotFoundException('Occupancy data not found');
    return occupancy;
  }

  async updateOccupancy(parkingId: string, dto: UpdateOccupancyDto) {
    await this.findOne(parkingId);
    let occupancy = await this.occupancyRepo.findOne({
      where: { parkingId },
    });

    if (!occupancy) {
      occupancy = this.occupancyRepo.create({ parkingId, ...dto });
    } else {
      Object.assign(occupancy, dto);
    }

    return this.occupancyRepo.save(occupancy);
  }

  async getPricing(parkingId: string) {
    const parking = await this.findOne(parkingId);
    return {
      priceHourly: parking.priceHourly,
      priceDaily: parking.priceDaily,
    };
  }

  async updatePricing(
    parkingId: string,
    dto: UpdatePricingDto,
    userId: string,
    userRole: UserRole,
  ) {
    const parking = await this.findOne(parkingId);
    if (userRole !== UserRole.ADMIN && parking.ownerId !== userId) {
      throw new ForbiddenException('Not authorized to update pricing');
    }
    parking.priceHourly = dto.priceHourly;
    if (dto.priceDaily !== undefined) parking.priceDaily = dto.priceDaily;
    return this.parkingRepo.save(parking);
  }

  async uploadImages(parkingId: string, imageUrls: string[]) {
    const parking = await this.findOne(parkingId);
    parking.images = [...(parking.images || []), ...imageUrls];
    return this.parkingRepo.save(parking);
  }

  async getAnalytics() {
    const total = await this.parkingRepo.count();
    const active = await this.parkingRepo.count({ where: { isActive: true } });

    const occupancyStats = await this.occupancyRepo
      .createQueryBuilder('o')
      .select('SUM(o.available_spots)', 'totalAvailable')
      .addSelect('SUM(o.occupied_spots)', 'totalOccupied')
      .addSelect('SUM(o.reserved_spots)', 'totalReserved')
      .getRawOne();

    return {
      totalLocations: total,
      activeLocations: active,
      totalAvailableSpots: Number(occupancyStats.totalAvailable) || 0,
      totalOccupiedSpots: Number(occupancyStats.totalOccupied) || 0,
      totalReservedSpots: Number(occupancyStats.totalReserved) || 0,
      occupancyRate:
        occupancyStats.totalOccupied && occupancyStats.totalAvailable
          ? (
              (Number(occupancyStats.totalOccupied) /
                (Number(occupancyStats.totalAvailable) +
                  Number(occupancyStats.totalOccupied))) *
              100
            ).toFixed(1) + '%'
          : '0%',
    };
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
