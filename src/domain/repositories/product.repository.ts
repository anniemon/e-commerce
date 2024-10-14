import { IProductRepository } from '@interfaces/repository';
import { ProductTypeOrmRepository } from '@infrastructure/typeorm/repositories/product.repository';

export class ProductRepository implements IProductRepository {
  constructor(
    private readonly productOrmRepository: ProductTypeOrmRepository,
  ) {}

  async getProductByIdWithStock(productId: number) {
    return this.productOrmRepository.getProductByIdWithStock(productId);
  }
}
