import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUserPoint1729096125647 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO user (name, email, balance)
            VALUES ('user1', 'user1@email.com', 1000), ('user2', 'user2@email.com', 2000), ('user3', 'user3@email.com', 5000);`,
      await queryRunner.query(
        `INSERT INTO point_transaction (amount, transaction_type, user_id) VALUES (1000, 'load', 1), (3000, 'load', 2), (10000, 'load', 3);`,
      ),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM user WHERE name IN ('user1', 'user2', 'user3');`,
    );
    await queryRunner.query(
      `DELETE FROM point_transaction WHERE user_id IN (1, 2, 3);`,
    );
  }
}
