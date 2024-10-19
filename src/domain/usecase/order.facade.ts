import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ProductService } from '@domain/services';
import { OrderEntity } from '@domain/entities';
import { OrderService } from '@domain/services/order.service';

// XXX: facade가 injectable 해야하나?
@Injectable()
export class OrderFacade {
  constructor(
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    // TODO: paymentService 추가
    // TODO: transaction 관리용 인터페이스 추가
    private readonly dataSource: DataSource,
  ) {
    this.productService = productService;
    this.orderService = orderService;
  }

  async createOrderWithTransaction({
    userId,
    items,
  }: {
    userId: number;
    items: { productId: number; quantity: number }[];
  }): Promise<{
    order: OrderEntity;
    totalAmount: number;
    outOfStockProductIds: number[];
  }> {
    //TODO: 결제 서비스(유저 포인트 차감) 추가
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const inStockProductsIds =
        await this.productService.decrementStockWithLock({
          items,
          queryRunner,
        });

      const inStockProducts =
        await this.productService.findProductsByIds(inStockProductsIds);

      // TODO: 재고 없는 상품 조회 로직 분리
      const outOfStockProductIds = items
        .map((i) => i.productId)
        .filter((productId) => !inStockProductsIds.includes(productId));

      const productsForOrder = inStockProducts.map((product) => {
        const quantity = items.find(
          (i) => i.productId === product.id,
        )?.quantity;

        return {
          productId: product.id,
          quantity,
          price: product.price,
        };
      });

      const order = await this.orderService.createOrder({
        userId,
        items: productsForOrder,
        queryRunner,
      });

      await queryRunner.commitTransaction();

      const totalAmount = inStockProducts.reduce(
        (acc, product) => acc + product.price,
        0,
      );

      return {
        order,
        totalAmount,
        outOfStockProductIds,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
