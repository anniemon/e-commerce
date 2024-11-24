import { QueryRunner } from 'typeorm';
import { UserPointEntity } from '@domain/entities';

export interface IUserRepository {
  selectById(userId: number): Promise<UserPointEntity>;
  chargeBalanceWithLock(
    userId: number,
    amount: number,
    queryRunner: QueryRunner,
  ): Promise<UserPointEntity>;
  useBalanceWithLock(
    userId: number,
    amount: number,
    queryRunner: QueryRunner,
  ): Promise<UserPointEntity>;
}
