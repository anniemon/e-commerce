import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductFacade } from '@domain/usecase/product.facade';

@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(private readonly productFacade: ProductFacade) {}

  @Get(':productId')
  async getProductByIdWithStock(@Param('productId') productId: number) {
    return this.productFacade.getProductByIdWithStock(productId);
  }
}
