import { IsInt } from 'class-validator';

export class ProductDTO {
  @IsInt()
  productId: number;
}
