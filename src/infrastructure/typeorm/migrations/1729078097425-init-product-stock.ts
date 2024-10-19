import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitProductStock1729078097425 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO product (name, description, price)
      VALUES ('product1', 'description1', 1000), ('product2', 'description2', 2000), ('product3', 'description3', 3000);`,
    );
    await queryRunner.query(
      `INSERT INTO stock (product_id, quantity)
      VALUES (1, 10000), (2, 20), (3, 30);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM product WHERE name IN ('product1', 'product2', 'product3');`,
    );
    await queryRunner.query(`DELETE FROM stock WHERE product_id IN (1, 2, 3);`);
  }
}
