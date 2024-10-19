import { Controller, Get, Param, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductFacade } from '@domain/usecase';

@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(private readonly productFacade: ProductFacade) {}

  @Get(':productId')
  async getProductByIdWithStock(
    @Param(
      'productId',
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    productId: number,
  ) {
    return this.productFacade.getProductByIdWithStock(productId);
  }
}
