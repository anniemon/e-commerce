import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  root(): string {
    return 'E-commerce API';
  }
}
