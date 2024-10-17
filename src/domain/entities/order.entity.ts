export class OrderEntity {
  id: number;
  userId: number;
  status: string;
  items: Array<OrderItemEntity>;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderItemEntity {
  id: number;
  quantity: number;
  price: number;
  orderId: number;
  productId: number;
  createdAt: Date;
  updatedAt: Date;
}
