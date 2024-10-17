import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', unsigned: true })
  quantity: number;

  @Column({ type: 'int', unsigned: true })
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Order, (order) => order.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'order_id' })
  orderId: number;

  @OneToOne(() => Product, (product) => product.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'product_id' })
  productId: number;
}
