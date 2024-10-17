import { QueryRunner } from 'typeorm';
import { OrderEntity } from '@domain/entities';

export interface IOrderRepository {
  createOrder({
    userId,
    items,
    queryRunner,
  }: {
    userId: number;
    items: { productId: number; quantity: number; price: number }[];
    queryRunner: QueryRunner;
  }): Promise<OrderEntity>;
}
