import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Booking } from './booking.entity';
import { Occupancy } from './occupancy.entity';

@Entity('parking_locations')
@Index('IDX_parking_location', ['latitude', 'longitude'])
export class ParkingLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'integer', name: 'total_capacity' })
  totalCapacity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'price_hourly' })
  priceHourly: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'price_daily',
  })
  priceDaily: number;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  images: string[];

  @Column({ type: 'jsonb', nullable: true })
  amenities: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.parkingLocations)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Booking, (booking) => booking.parking)
  bookings: Booking[];

  @OneToOne(() => Occupancy, (occupancy) => occupancy.parking)
  occupancy: Occupancy;
}
