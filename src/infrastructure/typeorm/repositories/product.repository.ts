import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IProductRepository } from '@interfaces/repository';
import { Product } from '../entities/product.entity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ProductEntity } from '@domain/entities';

@Injectable()
export class ProductTypeOrmRepository
  extends Repository<Product>
  implements IProductRepository
{
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super(Product, dataSource.createEntityManager());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getProductByIdWithStock(productId: number): Promise<any> {
    // TODO: Implement this method
    return {
      id: 1,
      name: 'Product Name',
      stock: 10,
      description: 'Product Description',
      price: 100,
      quantity: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
