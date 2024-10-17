import { Module } from '@nestjs/common';
import { OrderTypeOrmModule } from '@infrastructure/modules';
import { OrderRepository } from '@domain/repositories';
import { OrderService } from '@domain/services';

@Module({
  imports: [OrderTypeOrmModule],
  controllers: [],
  providers: [OrderService, OrderRepository],
  exports: [OrderService],
})
export class OrderServiceModule {}
