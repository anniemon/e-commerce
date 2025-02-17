import { Module } from '@nestjs/common';
import * as modules from '../../domain/modules';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from '@infrastructure/typeorm/data-source';
import { AppController } from '@application/controllers';
import { AppService } from '@domain/services';
import { HttpExceptionsFilter } from '../filters/global-exception.filter';

const modulesList = Object.keys(modules).map(
  (moduleIndex) => modules[moduleIndex as keyof typeof modules],
);

@Module({
  imports: [
    ...modulesList,
    TypeOrmModule.forRoot({ ...dataSource.options, autoLoadEntities: true }),
  ],
  providers: [
    AppService,
    {
      provide: 'DataSource',
      useValue: dataSource,
    },
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionsFilter,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
