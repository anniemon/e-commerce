import { DataSource, DataSourceOptions } from 'typeorm';

// TODO: 환경별 설정 분리
export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: 'mysql',
  port: 3307,
  username: 'anniemon',
  password: 'anniemon',
  database: 'e-commerce_local',
  migrationsRun: true,
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: true,
  logging: true,
};

const dataSource = new DataSource(<DataSourceOptions>dataSourceOptions);
export default dataSource;
