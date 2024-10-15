import { NestFactory } from '@nestjs/core';
import { AppModule } from '@application/modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const NODE_PORT = process.env.NODE_PORT || 3000;
  await app.listen(NODE_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`*** server is running on ${NODE_PORT} ***`);
  });
}
bootstrap();
