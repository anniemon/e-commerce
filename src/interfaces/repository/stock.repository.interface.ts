export interface IStockRepository {
  decrementStockWithLock({ productId, quantity, queryRunner }): Promise<number>;
}
