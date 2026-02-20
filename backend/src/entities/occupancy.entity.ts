import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ParkingLocation } from './parking-location.entity';

@Entity('occupancy')
export class Occupancy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'parking_id' })
  parkingId: string;

  @Column({ type: 'integer', name: 'available_spots' })
  availableSpots: number;

  @Column({ type: 'integer', name: 'occupied_spots' })
  occupiedSpots: number;

  @Column({ type: 'integer', default: 0, name: 'reserved_spots' })
  reservedSpots: number;

  @Column({ type: 'timestamp', nullable: true, name: 'last_entry_at' })
  lastEntryAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'last_exit_at' })
  lastExitAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => ParkingLocation, (parking) => parking.occupancy)
  @JoinColumn({ name: 'parking_id' })
  parking: ParkingLocation;
}
