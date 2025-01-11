import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '@domain/services';
import { ProductRepository, StockRepository } from '@domain/repositories';
import { OutOfStockException } from '@domain/exceptions';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let productService: ProductService;
  const productRepository = {
    getProductByIdWithStock: jest.fn().mockResolvedValue({ id: 1 }),
    findProductsByIdsWithStock: jest
      .fn()
      .mockResolvedValue([{ id: 1 }, { id: 2 }]),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('상품 조회 성공', () => {
    it('getProductByIdWithStock: 상품 아이디로 상품 조회 메서드를 호출해야 한다.', async () => {
      const productId = 1;
      const product = await productService.getProductByIdWithStock(productId);

      expect(product.id).toBe(productId);
      expect(productRepository.getProductByIdWithStock).toHaveBeenCalledWith(
        productId,
      );
      expect(productRepository.getProductByIdWithStock).toHaveBeenCalledTimes(
        1,
      );
    });

    it('findProductsByIdsWithStock: 상품 아이디 배열로 상품 조회 메서드를 호출해야 한다.', async () => {
      const productIds = [1, 2];
      const products =
        await productService.findProductsByIdsWithStock(productIds);

      expect(products.length).toBe(productIds.length);
      expect(productRepository.findProductsByIdsWithStock).toHaveBeenCalledWith(
        productIds,
      );
      expect(
        productRepository.findProductsByIdsWithStock,
      ).toHaveBeenCalledTimes(1);
    });

    it('findProductsByIdsWithStock: 상품이 없을 떄 빈 배열을 반환해야 한다.', async () => {
      const productIds = [1, 2];
      productRepository.findProductsByIdsWithStock.mockResolvedValueOnce([]);
      const products =
        await productService.findProductsByIdsWithStock(productIds);

      expect(products.length).toBe(0);
    });
  });

  describe('상품 조회 실패', () => {
    it('getProductByIdWithStock: 상품 조회 에러 발생 시 에러가 발생해야 한다.', async () => {
      productRepository.getProductByIdWithStock.mockRejectedValueOnce(
        new Error(),
      );
      const productId = 1;

      await expect(
        productService.getProductByIdWithStock(productId),
      ).rejects.toThrow();
    });

    it('getProductByIdWithStock: 상품이 없을 때 NotFoundException이 발생해야 한다.', async () => {
      productRepository.getProductByIdWithStock.mockResolvedValueOnce(null);
      const productId = 1;

      await expect(
        productService.getProductByIdWithStock(productId),
      ).rejects.toThrow(NotFoundException);
    });

    it('findProductsByIdsWithStock: 상품 조회 에러 발생 시 에러가 발생해야 한다.', async () => {
      productRepository.findProductsByIdsWithStock.mockRejectedValueOnce(
        new Error(),
      );
      const productIds = [1, 2];

      await expect(
        productService.findProductsByIdsWithStock(productIds),
      ).rejects.toThrow(new Error());
    });
  });

  describe('상품 재고 차감 성공', () => {
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

    it('decrementStockWithLock: 재고가 있는 상품과 없는 상품을 구분하여 반환한다.', async () => {
      const items = [
        { productId: 1, quantity: 0 },
        { productId: 2, quantity: 2 },
      ];
      stockRepository.decrementStockWithLock.mockRejectedValueOnce(
        new OutOfStockException(),
      );

      const res = await productService.decrementStockWithLock({
        items,
        queryRunner: null,
      });

      expect(res.inStockProductIds).toEqual([2]);
      expect(res.outOfStockProductIds).toEqual([1]);
    });
  });

  describe('상품 재고 차감 실패', () => {
    it('decrementStockWithLock: 상품 재고 차감 에러 발생 시 에러가 발생해야 한다.', async () => {
      stockRepository.decrementStockWithLock.mockRejectedValueOnce(new Error());
      const items = [{ productId: 1, quantity: 1 }];

      await expect(
        productService.decrementStockWithLock({
          items,
          queryRunner: null,
        }),
      ).rejects.toThrow();
    });

    it('decrementStockWithLock: 모든 상품이 재고가 없을 때 NotFoundException이 발생해야 한다.', async () => {
      const items = [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 1 },
      ];
      stockRepository.decrementStockWithLock.mockRejectedValue(
        new OutOfStockException(),
      );

      await expect(
        productService.decrementStockWithLock({
          items,
          queryRunner: null,
        }),
      ).rejects.toThrow(new NotFoundException('상품 재고가 부족합니다.'));
    });
  });
});
