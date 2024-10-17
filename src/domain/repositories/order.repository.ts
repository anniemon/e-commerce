import { Inject, Injectable } from '@nestjs/common';
import { OrderTypeOrmRepository } from '@infrastructure/typeorm/repositories';
import { IOrderRepository } from '@interfaces/repository';
import { OrderEntity } from '@domain/entities';

@Injectable()
export class OrderRepository {
  constructor(
    @Inject(OrderTypeOrmRepository)
    private readonly orderOrmRepository: IOrderRepository,
  ) {}

  async createOrder({ userId, items, queryRunner }): Promise<OrderEntity> {
    return this.orderOrmRepository.createOrder({ userId, items, queryRunner });
  }
}
