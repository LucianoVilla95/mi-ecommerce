import { DataSource, DataSourceOptions } from "typeorm";
import { registerAs } from '@nestjs/config';

const config: DataSourceOptions = {
  type: 'postgres',
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true
}

export default registerAs('typeorm', () => config);

export const AppDataSource: DataSource = new DataSource(config);