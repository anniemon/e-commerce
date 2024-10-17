import { StockEntity } from '@domain/entities';

export interface IStockRepository {
  decrementStockWithLock({
    productId,
    quantity,
    queryRunner,
  }): Promise<StockEntity | null>;
}
