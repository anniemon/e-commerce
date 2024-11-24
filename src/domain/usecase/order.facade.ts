import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PointService, ProductService, OrderService } from '@domain/services';
import { OrderEntity } from '@domain/entities';

@Injectable()
export class OrderFacade {
  constructor(
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly pointService: PointService,
    // TODO: transaction 관리용 인터페이스 추가
    private readonly dataSource: DataSource,
  ) {}

  async createOrderWithTransaction({
    userId,
    items,
  }: {
    userId: number;
    items: { productId: number; quantity: number }[];
  }): Promise<{
    order: OrderEntity;
    totalPrice: number;
    outOfStockProductIds: number[];
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    // TODO: trx 메서드명 분리
    try {
      const { inStockProductIds, outOfStockProductIds } =
        await this.productService.decrementStockWithLock({
          items,
          queryRunner,
        });

      const inStockProducts =
        await this.productService.findProductsByIdsWithStock(inStockProductIds);

      const productOrderMap = new Map<number, number>();
      items.forEach((item) => {
        productOrderMap.set(item.productId, item.quantity);
      });
      // TODO: totalPirce 계산 메서드 분리
      const totalPrice = inStockProducts.reduce((acc, product) => {
        const quantity = productOrderMap.get(product.id);
        return acc + product.price * quantity;
      }, 0);

      await this.pointService.usePointWithLock({
        queryRunner,
        userId,
        amount: totalPrice,
      });

      const orderItems = inStockProducts.map((product) => {
        return {
          productId: product.id,
          quantity: productOrderMap.get(product.id),
          price: product.price,
        };
      });

      const order: OrderEntity = await this.orderService.createOrder({
        userId,
        items: orderItems,
        queryRunner,
      });

      await queryRunner.commitTransaction();

      return {
        order,
        totalPrice,
        outOfStockProductIds,
      };
    } catch (error) {
      // todo: 로거 추가
      console.log(error, 'Error creating order');
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
