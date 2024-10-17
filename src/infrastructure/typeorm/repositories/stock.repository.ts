import { Injectable } from '@nestjs/common';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Stock } from '../entities';
import { IStockRepository } from '@interfaces/repository';

@Injectable()
export class StockTypeOrmRepository
  extends Repository<Stock>
  implements IStockRepository
{
  constructor(private readonly dataSource: DataSource) {
    super(Stock, dataSource.createEntityManager());
  }

  async decrementStockWithLock({
    productId,
    quantity,
    queryRunner,
  }: {
    productId: number;
    quantity: number;
    queryRunner: QueryRunner;
  }) {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .setLock('pessimistic_write')
      .update(Stock)
      .set({ quantity: () => `quantity - ${quantity}` })
      .where('product_id = :productId', { productId })
      .andWhere('quantity >= :quantity', { quantity })
      .execute();

    return result.affected;
  }
}
