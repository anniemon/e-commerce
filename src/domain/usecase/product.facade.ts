import { Injectable } from '@nestjs/common';
import { ProductService } from '@domain/services';

// XXX: productFacade 있어야 할까?..
@Injectable()
export class ProductFacade {
  constructor(private readonly productService: ProductService) {
    this.productService = productService;
  }

  async getProductByIdWithStock(productId: number) {
    return this.productService.getProductByIdWithStock(productId);
  }
}
