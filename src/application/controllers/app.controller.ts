import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from '@domain/services/app.service';

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
