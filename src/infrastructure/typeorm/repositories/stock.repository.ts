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
    const stock = await queryRunner.manager
      .createQueryBuilder(Stock, 'stock')
      .setLock('pessimistic_write')
      .where('stock.product_id = :productId', { productId })
      .andWhere('stock.quantity >= :quantity', { quantity })
      .getOne();

    if (!stock) {
      return null;
    }

    stock.quantity -= quantity;
    await queryRunner.manager.save(stock);

    return stock;
  }
}
