import { Inject, Injectable } from '@nestjs/common';
import { OrderRepository } from '@domain/repositories';
import { OrderEntity } from '@domain/entities';

@Injectable()
export class OrderService {
  constructor(
    @Inject(OrderRepository)
    private readonly orderRepository: OrderRepository,
  ) {}

  async createOrder({ userId, items, queryRunner }): Promise<OrderEntity> {
    return this.orderRepository.createOrder({ userId, items, queryRunner });
  }
}
