import { Inject, Injectable } from '@nestjs/common';
import { ProductTypeOrmRepository } from '@infrastructure/typeorm/repositories';
import { IProductRepository } from '@interfaces/repository';

@Injectable()
export class ProductRepository {
  constructor(
    @Inject(ProductTypeOrmRepository)
    private readonly productOrmRepository: IProductRepository,
  ) {}

  async getProductByIdWithStock(productId: number) {
    return this.productOrmRepository.getProductByIdWithStock(productId);
  }

  async findProductsByIdsWithStock(productIds: number[]) {
    return await this.productOrmRepository.findProductsByIdsWithStock(
      productIds,
    );
  }

  async findProductsByIds(productIds: number[]) {
    return this.productOrmRepository.findProductsByIds(productIds);
  }
}
