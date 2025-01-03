import { QueryRunner } from 'typeorm';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository, StockRepository } from '@domain/repositories';
import { OutOfStockException } from '@domain/exceptions';
import { ProductStockEntity } from '@domain/entities';

@Injectable()
export class ProductService {
  constructor(
    @Inject(ProductRepository)
    private readonly productRepository: ProductRepository,
    @Inject(StockRepository)
    private readonly stockRepository: StockRepository,
  ) {}

  async getProductByIdWithStock(productId: number) {
    const product =
      await this.productRepository.getProductByIdWithStock(productId);
    if (!product) {
      throw new NotFoundException();
    }
    return product;
  }

  async decrementStockWithLock({
    items,
    queryRunner,
  }: {
    items: { productId: number; quantity: number }[];
    queryRunner: QueryRunner;
  }): Promise<{ inStockProductIds: number[]; outOfStockProductIds: number[] }> {
    /**
     * 재고가 없는 상품은 로그만 남기고 넘어간다.
     * 모든 상품이 재고가 없으면 예외 발생시킨다. (트랜잭션 롤백)
     * 재고가 하나라도 있으면 해당 상품들만 조회하여 반환한다.
     */
    const inStockProductIds: number[] = [];
    const outOfStockProductIds: number[] = [];

    for (const item of items) {
      try {
        await this.stockRepository.decrementStockWithLock({
          productId: item.productId,
          quantity: item.quantity,
          queryRunner,
        });
        inStockProductIds.push(Number(item.productId));
      } catch (error) {
        // TODO: 로거 추가
        if (error instanceof OutOfStockException) {
          console.log(`====ProductId: ${item.productId} OUT OF STOCK!====`);
          outOfStockProductIds.push(item.productId);
        }
      }
    }

    if (inStockProductIds.length === 0) {
      throw new NotFoundException('상품 재고가 부족합니다.');
    }
    return { inStockProductIds, outOfStockProductIds };
  }

  async findProductsByIdsWithStock(
    productIds: number[],
  ): Promise<ProductStockEntity[]> {
    return this.productRepository.findProductsByIdsWithStock(productIds);
  }
}
