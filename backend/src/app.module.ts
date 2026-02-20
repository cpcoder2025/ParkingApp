import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
// import { ParkingModule } from './parking/parking.module';
// import { BookingsModule } from './bookings/bookings.module';
// import { PaymentsModule } from './payments/payments.module';
import {
  User,
  ParkingLocation,
  Booking,
  Payment,
  Occupancy,
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get('DATABASE_USER', 'postgres'),
        password: config.get('DATABASE_PASSWORD', 'postgres'),
        database: config.get('DATABASE_NAME', 'parking_db'),
        entities: [User, ParkingLocation, Booking, Payment, Occupancy],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    AuthModule,
    // ParkingModule,
    // BookingsModule,
    // PaymentsModule,
  ],
})
export class AppModule {}
