import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { Stock } from './stock.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', unsigned: true })
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Stock, (stock) => stock.productId, { cascade: true })
  stock: Stock;
}
