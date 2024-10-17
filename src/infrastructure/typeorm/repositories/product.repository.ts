import { Injectable } from '@nestjs/common';
import { Repository, DataSource, In } from 'typeorm';
import { IProductRepository } from '@interfaces/repository';
import { Product } from '../entities';
import { ProductEntity, ProductStockEntity } from '@domain/entities';

@Injectable()
export class ProductTypeOrmRepository
  extends Repository<Product>
  implements IProductRepository
{
  constructor(private readonly dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async getProductByIdWithStock(
    productId: number,
  ): Promise<ProductStockEntity> {
    const product = await this.createQueryBuilder('product')
      .leftJoinAndSelect('product.stock', 'stock')
      .where('product.id = :productId', { productId })
      .getOne();

    if (!product) {
      return null;
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.stock.quantity,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async findProductsByIds(productIds: number[]): Promise<ProductEntity[]> {
    const products = await this.findBy({
      id: In(productIds),
    });
    // XXX: product id가 string으로 리턴되어서 number로 변환
    return products.map((product) => ({
      id: Number(product.id),
      name: product.name,
      description: product.description,
      price: product.price,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  }
}
