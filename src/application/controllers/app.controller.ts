import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from '@domain/services/app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  constructor(
    @Inject(AppService)
    private readonly appSerivce: AppService,
  ) {}

  @Get()
  root() {
    return this.appSerivce.root();
  }
}
