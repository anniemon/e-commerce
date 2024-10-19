import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { OrderFacade } from '@domain/usecase';
import { CreateOrderDto } from '@application/dtos/order.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderFacade: OrderFacade) {}

  @Post()
  async createOrder(@Body(ValidationPipe) order: CreateOrderDto) {
    const { userId, items } = order;
    return this.orderFacade.createOrderWithTransaction({ userId, items });
  }
}
