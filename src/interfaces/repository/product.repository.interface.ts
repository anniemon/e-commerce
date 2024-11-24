import { ProductEntity, ProductStockEntity } from '@domain/entities';

export interface IProductRepository {
  getProductByIdWithStock(
    productId: number,
  ): Promise<ProductStockEntity | null>;
  findProductsByIds(productIds: number[]): Promise<ProductEntity[]>;
  findProductsByIdsWithStock(
    productIds: number[],
  ): Promise<ProductStockEntity[]>;
}
