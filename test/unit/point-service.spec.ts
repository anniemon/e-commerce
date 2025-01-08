import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { PointService } from '@domain/services';
import {
  PointTransactionRepository,
  UserRepository,
} from '@domain/repositories';
import { TransactionType } from '@domain/enums';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PointService', () => {
  let pointService: PointService;
  const userRepository = {
    selectById: jest.fn(),
    chargeBalanceWithLock: jest.fn(),
    useBalanceWithLock: jest.fn(),
  };
  const pointTransactionRepository = {
    createPointTransaction: jest.fn(),
  };
  const queryRunner = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  } as any;
  const dataSource = {
    createQueryRunner: jest.fn().mockReturnValue(queryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointService,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: PointTransactionRepository,
          useValue: pointTransactionRepository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    pointService = module.get<PointService>(PointService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserBalance', () => {
    it('성공: 사용자 아이디로 사용자 잔액 조회 메서드를 호출해야 한다.', async () => {
      userRepository.selectById.mockResolvedValueOnce({ id: 1, balance: 1000 });
      const userId = 1;
      const user = await pointService.getUserBalance(userId);

      expect(user.id).toBe(userId);
      expect(userRepository.selectById).toHaveBeenCalledWith(userId);
      expect(userRepository.selectById).toHaveBeenCalledTimes(1);
    });

    it('실패: 사용자를 찾을 수 없을 때 에러가 발생해야 한다.', async () => {
      userRepository.selectById.mockResolvedValueOnce(null);
      const userId = 1;

      await expect(pointService.getUserBalance(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('chargePoint', () => {
    it('성공: 사용자 아이디와 금액으로 사용자 잔액 충전 메서드를 호출해야 한다.', async () => {
      userRepository.chargeBalanceWithLock.mockResolvedValueOnce({
        balance: 1100,
      });
      userRepository.selectById.mockResolvedValueOnce({ id: 1, balance: 1000 });

      const pointDto = { userId: 1, amount: 100 };
      const userPoint = await pointService.chargePoint(pointDto);

      expect(userPoint).toBeDefined();
      expect(userRepository.chargeBalanceWithLock).toHaveBeenCalledWith(
        pointDto.userId,
        pointDto.amount,
        queryRunner,
      );
      expect(userRepository.chargeBalanceWithLock).toHaveBeenCalledTimes(1);
      expect(
        pointTransactionRepository.createPointTransaction,
      ).toHaveBeenCalledWith(
        pointDto.userId,
        pointDto.amount,
        TransactionType.LOAD,
        queryRunner,
      );
      expect(
        pointTransactionRepository.createPointTransaction,
      ).toHaveBeenCalledTimes(1);
    });

    it('실패: 사용자를 찾을 수 없을 때 NotFoundException이 발생해야 한다.', async () => {
      const pointDto = { userId: 1, amount: 100 };

      userRepository.selectById.mockResolvedValueOnce(null);
      userRepository.chargeBalanceWithLock.mockResolvedValueOnce({
        balance: 1100,
      });

      await expect(pointService.chargePoint(pointDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('실패: 잔액 충전 실패 시 에러가 발생해야 한다.', async () => {
      const pointDto = { userId: 1, amount: 100 };

      userRepository.selectById.mockResolvedValueOnce({ id: 1, balance: 1000 });
      // XXX: 재할당하는 것보단 beforeEach에서 초기화하는 것이 좋을 듯..
      userRepository.chargeBalanceWithLock = jest
        .fn()
        .mockRejectedValueOnce(new Error('error'));

      await expect(pointService.chargePoint(pointDto)).rejects.toThrow(Error);
    });
  });

  describe('usePointWithLock', () => {
    it('성공: 사용자 아이디와 금액으로 잔액 차감 메서드를 호출해야 한다.', async () => {
      userRepository.selectById.mockResolvedValueOnce({ id: 1, balance: 1000 });

      const userId = 1;
      const amount = 1000;

      await pointService.usePointWithLock({ queryRunner, userId, amount });

      expect(userRepository.selectById).toHaveBeenCalledWith(userId);
      expect(userRepository.selectById).toHaveBeenCalledTimes(1);
      expect(userRepository.useBalanceWithLock).toHaveBeenCalledWith(
        userId,
        amount,
        queryRunner,
      );
      expect(userRepository.useBalanceWithLock).toHaveBeenCalledTimes(1);
      expect(
        pointTransactionRepository.createPointTransaction,
      ).toHaveBeenCalledWith(
        userId,
        amount,
        TransactionType.REDEEM,
        queryRunner,
      );
      expect(
        pointTransactionRepository.createPointTransaction,
      ).toHaveBeenCalledTimes(1);
    });

    it('실패: 사용자를 찾을 수 없을 때 NotFoundException이 발생해야 한다.', async () => {
      const userId = 1;
      const amount = 100;

      userRepository.selectById.mockResolvedValueOnce(null);

      await expect(
        pointService.usePointWithLock({ queryRunner, userId, amount }),
      ).rejects.toThrow(NotFoundException);
    });

    it('실패: 사용자 잔액이 부족할 때 BadRequestException이 발생해야 한다.', async () => {
      const userId = 1;
      const amount = 100;

      userRepository.selectById.mockResolvedValueOnce({ balance: 0 });

      await expect(
        pointService.usePointWithLock({ queryRunner, userId, amount }),
      ).rejects.toThrow(BadRequestException);
    });

    it('실패: 사용자 잔액 차감 중 에러가 발생하면 예외가 발생해야 한다.', async () => {
      const userId = 1;
      const amount = 100;

      userRepository.selectById.mockResolvedValueOnce({ balance: 1000 });
      userRepository.useBalanceWithLock.mockRejectedValueOnce(new Error());

      await expect(
        pointService.usePointWithLock({ queryRunner, userId, amount }),
      ).rejects.toThrow(Error);
    });
  });
});
