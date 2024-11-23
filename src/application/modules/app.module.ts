import { Module } from '@nestjs/common';
import * as modules from '../../domain/modules';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from '@infrastructure/typeorm/data-source';
import { AppController } from '@application/controllers';
import { AppService } from '@domain/services';

const modulesList = Object.keys(modules).map(
  (moduleIndex) => modules[moduleIndex as keyof typeof modules],
);

@Module({
  imports: [...modulesList, TypeOrmModule.forRoot(dataSource.options)],
  providers: [
    AppService,
    {
      provide: 'DataSource',
      useValue: dataSource,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
