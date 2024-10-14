import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'e-commerce',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
};

const dataSource = new DataSource(<DataSourceOptions>dataSourceOptions);
export default dataSource;
