import { DataSource } from 'typeorm';

export const setInitialData = async (
  dataSource: DataSource,
  fixtures: Record<string, any[]>,
) => {
  const targetFixtures = Object.assign({}, fixtures);

  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');

  for (const [tableName, rows] of Object.entries(targetFixtures)) {
    await dataSource.query(`TRUNCATE table ${tableName};`);
    if (rows?.length > 0) {
      await dataSource
        .createQueryBuilder()
        .insert()
        .into(tableName)
        .values(rows)
        .execute();
    }
  }

  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
};
