import { Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { IPointTransactionRepository } from '@interfaces/repository';
import { PointTransactionEntity } from '@domain/entities';
import { PointTransaction } from '../entities';
import { TransactionType } from '@domain/enums';

@Injectable()
export class PointTransactionTypeOrmRepository
  extends Repository<PointTransaction>
  implements IPointTransactionRepository
{
  constructor(
    @InjectDataSource()
    private readonly dataSource,
  ) {
    super(PointTransaction, dataSource.createEntityManager());
  }

  async createPointTransaction(
    userId: number,
    amount: number,
    transactionType: TransactionType,
    queryRunner: QueryRunner,
  ): Promise<PointTransactionEntity> {
    const pointTransaction = new PointTransaction();
    pointTransaction.userId = userId;
    pointTransaction.amount = amount;
    pointTransaction.transactionType = transactionType;

    return await queryRunner.manager.save(pointTransaction);
  }
}
