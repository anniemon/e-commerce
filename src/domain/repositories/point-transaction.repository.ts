import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { PointTransactionTypeOrmRepository } from '@infrastructure/typeorm/repositories';
import { IPointTransactionRepository } from '@interfaces/repository';
import { PointTransactionEntity } from '@domain/entities';
import { TransactionType } from '@domain/enums';

@Injectable()
export class PointTransactionRepository {
  constructor(
    @Inject(PointTransactionTypeOrmRepository)
    private readonly pointTransactionOrmRepository: IPointTransactionRepository,
  ) {}

  async createPointTransaction(
    userId: number,
    amount: number,
    transactionType: TransactionType,
    queryRunner: QueryRunner,
  ): Promise<PointTransactionEntity> {
    return this.pointTransactionOrmRepository.createPointTransaction(
      userId,
      amount,
      transactionType,
      queryRunner,
    );
  }
}
