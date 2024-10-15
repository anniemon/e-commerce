import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '@domain/services';
import { ProductRepository } from '@domain/repositories';

describe('ProductService', () => {
  let productService: ProductService;
  const productRepository = {
    getProductByIdWithStock: jest.fn().mockResolvedValue({
      id: 1,
      name: 'product',
      description: 'description',
      price: 1000,
      quantity: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: productRepository,
        },
      ],
    }).compile();

    productService = moduleFixture.get(ProductService);
  });

  it('상품 아이디로 상품 조회 메서드를 호출한다', async () => {
    const productId = 1;
    const product = await productService.getProductByIdWithStock(productId);

    expect(product.id).toBe(productId);
    expect(productRepository.getProductByIdWithStock).toHaveBeenCalledWith(
      productId,
    );
    expect(productRepository.getProductByIdWithStock).toHaveBeenCalledTimes(1);
  });
});
