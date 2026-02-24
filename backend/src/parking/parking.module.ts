import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingLocation, Occupancy } from '../entities';
import { ParkingService } from './parking.service';
import { ParkingController } from './parking.controller';
import { GeocodingModule } from '../geocoding/geocoding.module';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingLocation, Occupancy]), GeocodingModule],
  controllers: [ParkingController],
  providers: [ParkingService],
  exports: [ParkingService],
})
export class ParkingModule {}
