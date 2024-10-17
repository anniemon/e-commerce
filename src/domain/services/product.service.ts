import { QueryRunner } from 'typeorm';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository, StockRepository } from '@domain/repositories';
import { ProductEntity } from '@domain/entities';
import { OutOfStockException } from '@domain/exceptions';

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
  }): Promise<ProductEntity[]> {
    /**
     * 재고가 없는 상품은 로그만 남기고 넘어간다.
     * 모든 상품이 재고가 없으면 예외 발생시킨다. (트랜잭션 롤백)
     * 재고가 하나라도 있으면 해당 상품들만 조회하여 반환한다.
     */
    const inStockProductIds: number[] = [];

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
        }
      }
    }

    if (inStockProductIds.length === 0) {
      throw new NotFoundException();
    }
    return await this.findProductsByIds(inStockProductIds);
  }

  async findProductsByIds(productIds: number[]) {
    return this.productRepository.findProductsByIds(productIds);
  }
}
