import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@domain/repositories/product.repository';

@Injectable()
export class ProductService {
  constructor(
    @Inject(ProductRepository)
    private readonly productRepository: ProductRepository,
  ) {}

  async getProductByIdWithStock(productId: number) {
    const product =
      await this.productRepository.getProductByIdWithStock(productId);
    if (!product) {
      throw new NotFoundException();
    }
    return product;
  }
}
