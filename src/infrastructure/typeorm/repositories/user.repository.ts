import { Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { IUserRepository } from '@interfaces/repository';
import { UserPointEntity } from '@domain/entities';
import { User } from '../entities';

@Injectable()
export class UserTypeOrmRepository
  extends Repository<User>
  implements IUserRepository
{
  constructor(
    @InjectDataSource()
    private readonly dataSource,
  ) {
    super(User, dataSource.createEntityManager());
  }

  async selectById(userId: number): Promise<UserPointEntity> {
    const user = await this.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    return user;
  }

  async chargeBalanceWithLock(
    userId: number,
    amount: number,
    queryRunner: QueryRunner,
  ) {
    const user = await queryRunner.manager
      .createQueryBuilder(User, 'user')
      .setLock('pessimistic_write')
      .where('user.id = :userId', { userId })
      .getOne();

    user.balance += amount;

    return await queryRunner.manager.save(user);
  }

  async useBalanceWithLock(
    userId: number,
    amount: number,
    queryRunner: QueryRunner,
  ) {
    const user = await queryRunner.manager
      .createQueryBuilder(User, 'user')
      .setLock('pessimistic_write')
      .where('user.id = :userId', { userId })
      .getOne();

    user.balance -= amount;

    return await queryRunner.manager.save(user);
  }
}
