import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { IProductRepository } from '@interfaces/repository';
import { Product } from '../entities/product.entity';
import { ProductEntity } from '@domain/entities';

@Injectable()
export class ProductTypeOrmRepository
  extends Repository<Product>
  implements IProductRepository
{
  constructor(private readonly dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async getProductByIdWithStock(productId: number): Promise<ProductEntity> {
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
}
