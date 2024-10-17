export class ProductEntity {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductStockEntity extends ProductEntity {
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
