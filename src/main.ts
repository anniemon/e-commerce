import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@application/modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('E-commerce API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('.docs', app, document);

  const NODE_PORT = process.env.NODE_PORT || 3000;
  await app.listen(NODE_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`*** server is running on http://localhost:${NODE_PORT} ***`);
    console.log(
      `*** API document is running on http://localhost:${NODE_PORT}/.docs ***`,
    );
  });
}
bootstrap();
