import { QueryRunner } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { StockTypeOrmRepository } from '@infrastructure/typeorm/repositories';
import { IStockRepository } from '@interfaces/repository';
import { OutOfStockException } from '@domain/exceptions';

@Injectable()
export class StockRepository {
  constructor(
    @Inject(StockTypeOrmRepository)
    private readonly stockOrmRepository: IStockRepository,
  ) {}

  async decrementStockWithLock({
    productId,
    quantity,
    queryRunner,
  }: {
    productId: number;
    quantity: number;
    queryRunner: QueryRunner;
  }) {
    const stock = await this.stockOrmRepository.decrementStockWithLock({
      productId,
      quantity,
      queryRunner,
    });
    if (!stock) {
      throw new OutOfStockException();
    }
  }
}
