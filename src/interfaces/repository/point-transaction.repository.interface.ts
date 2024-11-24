import { PointTransactionEntity } from '@domain/entities';
import { TransactionType } from '@domain/enums';
import { QueryRunner } from 'typeorm';

export interface IPointTransactionRepository {
  createPointTransaction(
    userId: number,
    amount: number,
    transactionType: TransactionType,
    queryRunner: QueryRunner,
  ): Promise<PointTransactionEntity>;
}
