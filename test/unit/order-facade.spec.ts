import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderFacade } from '@domain/usecase';
import { OrderService, PointService, ProductService } from '@domain/services';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrderFacade', () => {
  let orderFacade: OrderFacade;

  const productService = {
    findProductsByIdsWithStock: jest.fn(),
    decrementStockWithLock: jest.fn(),
  };
  const orderService = {
    createOrder: jest.fn(),
  };
  const pointService = {
    usePointWithLock: jest.fn(),
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
        {
          provide: PointService,
          useValue: pointService,
        },
      ],
    }).compile();

    orderFacade = moduleFixture.get(OrderFacade);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrderWithTransaction: 주문 생성 성공', () => {
    it('재고와 유저 잔액이 충분할 때 주문 생성이 성공해야 한다.', async () => {
      const userId = 1;
      const items = [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 },
      ];

      productService.decrementStockWithLock.mockResolvedValueOnce({
        inStockProductIds: [1, 2],
        outOfStockProductIds: [],
      });
      productService.findProductsByIdsWithStock.mockResolvedValueOnce([
        { id: 1, price: 100, quantity: 1 },
        { id: 2, price: 200, quantity: 2 },
      ]);

      pointService.usePointWithLock.mockResolvedValueOnce({
        id: 1,
        balance: 1000,
      });

      orderService.createOrder.mockResolvedValueOnce({ id: 1, userId, items });

      const result = await orderFacade.createOrderWithTransaction({
        userId,
        items,
      });

      expect(result.order.id).toBe(1);
      expect(result.totalPrice).toBe(500);
      expect(productService.decrementStockWithLock).toHaveBeenCalledWith({
        items,
        queryRunner,
      });
      expect(productService.findProductsByIdsWithStock).toHaveBeenCalledWith([
        1, 2,
      ]);
      expect(pointService.usePointWithLock).toHaveBeenCalledWith({
        queryRunner,
        userId,
        amount: 500,
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

      productService.decrementStockWithLock.mockResolvedValueOnce({
        inStockProductIds: [1],
        outOfStockProductIds: [2],
      });

      productService.findProductsByIdsWithStock.mockResolvedValueOnce([
        { id: 1, price: 100, quantity: 1 },
      ]);

      pointService.usePointWithLock.mockResolvedValueOnce({
        id: 1,
        balance: 1000,
      });

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
      expect(result.totalPrice).toBe(100);
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
      expect(orderService.createOrder).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });
  });

  describe('createOrderWithTransaction: 주문 생성 실패', () => {
    it('모든 상품의 재고가 없으면 NotFoundException을 발생시키고, 트랜잭션이 롤백되어야 한다.', async () => {
      const userId = 1;
      const items = [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 },
      ];

      productService.decrementStockWithLock.mockRejectedValue(
        new NotFoundException('상품 재고가 부족합니다.'),
      );
      productService.findProductsByIdsWithStock.mockResolvedValueOnce([]);
      pointService.usePointWithLock.mockResolvedValueOnce({
        id: 1,
        balance: 1000,
      });
      orderService.createOrder.mockResolvedValueOnce({ id: 1, userId, items });

      await expect(
        orderFacade.createOrderWithTransaction({
          userId,
          items,
        }),
      ).rejects.toThrow(new NotFoundException('상품 재고가 부족합니다.'));

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('주문 생성 중 에러 발생 시 주문 생성이 실패하고 트랜잭션이 롤백되어야 한다.', async () => {
      const userId = 1;
      const items = [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 },
      ];

      productService.decrementStockWithLock.mockResolvedValueOnce({
        inStockProductIds: [1, 2],
        outOfStockProductIds: [],
      });
      productService.findProductsByIdsWithStock.mockResolvedValueOnce([
        { id: 1, price: 100, quantity: 1 },
        { id: 2, price: 200, quantity: 2 },
      ]);
      pointService.usePointWithLock.mockResolvedValueOnce({
        id: 1,
        balance: 1000,
      });
      orderService.createOrder = jest.fn().mockRejectedValueOnce(new Error());

      await expect(
        orderFacade.createOrderWithTransaction({
          userId,
          items,
        }),
      ).rejects.toThrow(Error);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('포인트 차감 중 에러 발생 시 주문 생성이 실패하고 트랜잭션이 롤백되어야 한다.', async () => {
      const userId = 1;
      const items = [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 },
      ];

      productService.decrementStockWithLock.mockResolvedValueOnce({
        inStockProductIds: [1, 2],
        outOfStockProductIds: [],
      });
      productService.findProductsByIdsWithStock.mockResolvedValueOnce([
        { id: 1, price: 100, quantity: 1 },
        { id: 2, price: 200, quantity: 2 },
      ]);
      pointService.usePointWithLock = jest.fn().mockRejectedValueOnce(Error());
      orderService.createOrder.mockResolvedValueOnce({ id: 1, userId, items });

      await expect(
        orderFacade.createOrderWithTransaction({ userId, items }),
      ).rejects.toThrow(Error);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('포인트 부족 시 BadRequestException을 발생시키고, 트랜잭션이 롤백되어야 한다.', async () => {
      const userId = 1;
      const items = [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 },
      ];

      productService.decrementStockWithLock.mockResolvedValueOnce({
        inStockProductIds: [1, 2],
        outOfStockProductIds: [],
      });
      productService.findProductsByIdsWithStock.mockResolvedValueOnce([
        { id: 1, price: 100, quantity: 1 },
        { id: 2, price: 200, quantity: 2 },
      ]);
      pointService.usePointWithLock.mockRejectedValueOnce(
        new BadRequestException('잔액이 부족합니다.'),
      );
      orderService.createOrder.mockResolvedValueOnce({ id: 1, userId, items });

      await expect(
        orderFacade.createOrderWithTransaction({ userId, items }),
      ).rejects.toThrow(new BadRequestException('잔액이 부족합니다.'));

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('유효하지 않은 사용자일 경우, NotFoundException을 발생시키고, 트랜잭션이 롤백되어야 한다.', async () => {
      const userId = 1;
      const items = [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 },
      ];

      pointService.usePointWithLock.mockRejectedValueOnce(
        new NotFoundException('사용자를 찾을 수 없습니다.'),
      );
      productService.decrementStockWithLock.mockResolvedValueOnce({
        inStockProductIds: [1, 2],
        outOfStockProductIds: [],
      });
      productService.findProductsByIdsWithStock.mockResolvedValueOnce([
        { id: 1, price: 100, quantity: 1 },
        { id: 2, price: 200, quantity: 2 },
      ]);
      orderService.createOrder.mockResolvedValueOnce({ id: 1, userId, items });

      await expect(
        orderFacade.createOrderWithTransaction({ userId, items }),
      ).rejects.toThrow(new NotFoundException('사용자를 찾을 수 없습니다.'));

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
