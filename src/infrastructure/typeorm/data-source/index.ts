import { DataSource, DataSourceOptions } from 'typeorm';

const { MYSQL_DATABASE } = process.env;
// TODO: 환경별 설정 분리
export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3307,
  bigNumberStrings: false,
  username: 'root',
  password: 'root',
  database: MYSQL_DATABASE ?? 'e_commerce_local',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: true,
  logging: true,
};

const dataSource = new DataSource(<DataSourceOptions>dataSourceOptions);
export default dataSource;
