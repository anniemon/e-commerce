import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { UserRepository } from '@domain/repositories';
import { PointDto } from '@application/dtos';
import { TransactionType } from '@domain/enums';
import { PointTransactionRepository } from '@domain/repositories';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class PointService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(PointTransactionRepository)
    private readonly pointTransactionRepository: PointTransactionRepository,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getUserBalance(userId: number) {
    const user = await this.userRepository.selectById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  async chargePoint(pointDto: PointDto) {
    const { userId, amount } = pointDto;

    const user = await this.getUserBalance(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // todo: named parameter로 변경
      const userPoint = await this.userRepository.chargeBalanceWithLock(
        userId,
        amount,
        queryRunner,
      );

      await this.pointTransactionRepository.createPointTransaction(
        userId,
        amount,
        TransactionType.LOAD,
        queryRunner,
      );
      await queryRunner.commitTransaction();

      return userPoint;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  async usePointWithLock({
    queryRunner,
    userId,
    amount,
  }: {
    queryRunner: QueryRunner;
    userId: number;
    amount: number;
  }) {
    const user = await this.getUserBalance(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (user.balance < amount) {
      throw new BadRequestException('잔액이 부족합니다.');
    }

    const userPoint = await this.userRepository.useBalanceWithLock(
      userId,
      amount,
      queryRunner,
    );

    await this.pointTransactionRepository.createPointTransaction(
      userId,
      amount,
      TransactionType.REDEEM,
      queryRunner,
    );

    return userPoint;
  }
}
