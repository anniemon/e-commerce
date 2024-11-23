import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { UserTypeOrmRepository } from '@infrastructure/typeorm/repositories';
import { IUserRepository } from '@interfaces/repository';
import { UserPointEntity } from '@domain/entities';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(UserTypeOrmRepository)
    private readonly UserOrmRepository: IUserRepository,
  ) {}

  async selectById(userId: number): Promise<UserPointEntity> {
    return this.UserOrmRepository.selectById(userId);
  }

  async chargeBalanceWithLock(
    userId: number,
    amount: number,
    queryRunner: QueryRunner,
  ): Promise<UserPointEntity> {
    return this.UserOrmRepository.chargeBalanceWithLock(
      userId,
      amount,
      queryRunner,
    );
  }

  async useBalanceWithLock(
    userId: number,
    amount: number,
    queryRunner: QueryRunner,
  ): Promise<UserPointEntity> {
    return this.UserOrmRepository.useBalanceWithLock(
      userId,
      amount,
      queryRunner,
    );
  }
}
