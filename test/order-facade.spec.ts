import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderFacade } from '@domain/usecase';
import { OrderService, ProductService } from '@domain/services';

describe('OrderFacade', () => {
  let orderFacade: OrderFacade;
  const productService = {
    getProductByIdWithStock: jest.fn(),
    findProductsByIds: jest.fn(),
    decrementStockWithLock: jest.fn(),
  };
  const orderService = {
    createOrder: jest.fn(),
  };
  const queryRunner = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };
  const dataSource = {
    createQueryRunner: jest.fn().mockReturnValue(queryRunner),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        OrderFacade,
        {
          provide: ProductService,
          useValue: productService,
        },
        {
          provide: OrderService,
          useValue: orderService,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    orderFacade = moduleFixture.get(OrderFacade);
  });

  describe('createOrderWithTransaction', () => {
    it('주문 생성 트랜잭션 성공', async () => {
      const userId = 1;
      const items = [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 },
      ];

      productService.decrementStockWithLock.mockResolvedValueOnce([
        { id: 1, price: 100 },
        { id: 2, price: 200 },
      ]);
      orderService.createOrder.mockResolvedValueOnce({ id: 1, userId, items });

      const result = await orderFacade.createOrderWithTransaction({
        userId,
        items,
      });

      expect(result.order.id).toBe(1);
      expect(result.totalAmount).toBe(300);
      expect(productService.decrementStockWithLock).toHaveBeenCalledWith({
        items,
        queryRunner,
      });
      expect(orderService.createOrder).toHaveBeenCalledWith({
        userId,
        items: [
          { productId: 1, quantity: 1, price: 100 },
          { productId: 2, quantity: 2, price: 200 },
        ],
        queryRunner,
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });

    it('재고가 있는 상품이 하나라도 있으면 주문 생성이 성공해야 한다.', async () => {
      const userId = 1;
      const items = [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 },
      ];

      productService.decrementStockWithLock.mockResolvedValueOnce([
        { id: 1, price: 100 },
      ]);
      orderService.createOrder.mockResolvedValueOnce({
        id: 1,
        userId,
        items: [{ orderId: 1, productId: 1, quantity: 1, price: 100 }],
      });

      const result = await orderFacade.createOrderWithTransaction({
        userId,
        items,
      });

      expect(result.order.id).toBe(1);
      expect(result.totalAmount).toBe(100);
      expect(result.order.items.length).toBe(1);
      expect(productService.decrementStockWithLock).toHaveBeenCalledWith({
        items,
        queryRunner,
      });
      expect(orderService.createOrder).toHaveBeenCalledWith({
        userId,
        items: [{ productId: 1, quantity: 1, price: 100 }],
        queryRunner,
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('모든 상품의 재고가 없으면 주문 생성이 실패해야 한다.', async () => {
      const userId = 1;
      const items = [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 },
      ];

      productService.decrementStockWithLock.mockRejectedValueOnce(
        new Error('Out of stock'),
      );
      orderService.createOrder.mockResolvedValueOnce({ id: 1, userId, items });

      try {
        await orderFacade.createOrderWithTransaction({
          userId,
          items,
        });
      } catch (e) {
        expect(e.message).toBe('Out of stock');
      }

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('주문 생성 중 에러 발생 시 주문 생성이 실패해야 한다.', async () => {
      const userId = 1;
      const items = [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 },
      ];

      productService.decrementStockWithLock.mockResolvedValueOnce([
        { id: 1, price: 100 },
        { id: 2, price: 200 },
      ]);
      orderService.createOrder.mockRejectedValueOnce(new Error('Order failed'));

      try {
        await orderFacade.createOrderWithTransaction({
          userId,
          items,
        });
      } catch (e) {
        expect(e.message).toBe('Order failed');
      }
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
