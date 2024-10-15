import { ProductEntity } from '@domain/entities';

export interface IProductRepository {
  getProductByIdWithStock(productId: number): Promise<ProductEntity | null>;
}
