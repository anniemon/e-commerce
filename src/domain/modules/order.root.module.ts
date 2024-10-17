import { Module } from '@nestjs/common';
import { OrderController } from '@application/controllers';
import { OrderFacade } from '@domain/usecase';
import { OrderServiceModule } from './order.service.module';
import { ProductModule } from './product.module';

@Module({
  imports: [OrderServiceModule, ProductModule],
  controllers: [OrderController],
  providers: [OrderFacade],
})
export class OrderRootModule {}
