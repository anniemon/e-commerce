import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '@domain/services';
import { ProductRepository, StockRepository } from '@domain/repositories';

describe('ProductService', () => {
  let productService: ProductService;
  const productRepository = {
    getProductByIdWithStock: jest.fn().mockResolvedValue({ id: 1 }),
    findProductsByIds: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
  };
  const stockRepository = {
    decrementStockWithLock: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: productRepository,
        },
        {
          provide: StockRepository,
          useValue: stockRepository,
        },
      ],
    }).compile();

    productService = moduleFixture.get(ProductService);
  });

  it('getProductByIdWithStock: 상품 아이디로 상품 조회 메서드를 호출해야 한다.', async () => {
    const productId = 1;
    const product = await productService.getProductByIdWithStock(productId);

    expect(product.id).toBe(productId);
    expect(productRepository.getProductByIdWithStock).toHaveBeenCalledWith(
      productId,
    );
    expect(productRepository.getProductByIdWithStock).toHaveBeenCalledTimes(1);
  });

  it('findProductsByIds: 상품 아이디 배열로 상품 조회 메서드를 호출해야 한다.', async () => {
    const productIds = [1, 2];
    const products = await productService.findProductsByIds(productIds);

    expect(products.length).toBe(productIds.length);
    expect(productRepository.findProductsByIds).toHaveBeenCalledWith(
      productIds,
    );
    expect(productRepository.findProductsByIds).toHaveBeenCalledTimes(1);
  });

  it('decrementStockWithLock: 주문 상품 갯수만큼 상품 재고 차감 메서드를 호출해야 한다.', async () => {
    const items = [
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 2 },
    ];
    await productService.decrementStockWithLock({
      items,
      queryRunner: null,
    });

    expect(stockRepository.decrementStockWithLock).toHaveBeenCalledTimes(
      items.length,
    );
  });
});
