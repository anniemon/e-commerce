import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { fixtures, setInitialData } from '@infrastructure/typeorm/helper';
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
export class AppModule {
  constructor(private readonly dataSource: DataSource) {}
  async onModuleInit() {
    try {
      await setInitialData(this.dataSource, fixtures);
      console.log('Initial data has been set');
    } catch (error) {
      console.error('Error setting initial data:', error);
    }
  }
}
