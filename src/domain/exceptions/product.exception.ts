export class OutOfStockException extends Error {
  constructor() {
    super('Out of stock');
  }
}
