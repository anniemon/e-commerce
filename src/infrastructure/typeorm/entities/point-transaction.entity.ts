import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TransactionType } from '@domain/enums';

@Entity()
export class PointTransaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', unsigned: true })
  amount: number;

  @Column({ name: 'transaction_type', type: 'varchar', length: 255 })
  transactionType: TransactionType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id' })
  userId: number;
}
