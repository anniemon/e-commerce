import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IOrderRepository } from '@interfaces/repository';
import { OrderEntity } from '@domain/entities';
import { Order, OrderItem } from '../entities';

@Injectable()
export class OrderTypeOrmRepository implements IOrderRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource,
  ) {}

  // TODO: order item 관련 메서드 분리 및 도메인 리포지토리에서 조합하여 사용
  async createOrder({ userId, items, queryRunner }): Promise<OrderEntity> {
    const order = new Order();
    order.userId = userId;
    order.status = 'ORDERED';

    const newOrders = await queryRunner.manager.save(order);

    if (newOrders.length === 0) {
      throw new Error('Failed to create order');
    }

    const orderItems = items.map((item) => {
      const orderItem = new OrderItem();
      orderItem.orderId = Number(order.id);
      orderItem.productId = item.productId;
      orderItem.quantity = item.quantity;
      orderItem.price = item.price;
      return orderItem;
    });

    const newOrderItems = await queryRunner.manager.save(OrderItem, orderItems);

    if (newOrderItems.length === 0) {
      throw new Error('Failed to create order items');
    }

    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: orderItems,
    };
  }
}
