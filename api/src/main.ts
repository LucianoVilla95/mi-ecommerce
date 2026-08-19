import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1); 
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    stopAtFirstError: true,
  }))

  const swaggerConfig = new DocumentBuilder()
  .setTitle('mi-ecommerce')
  .setDescription('Esta es una API construida con Nest para ecommerce')
  .setVersion('1.0')
  .addCookieAuth('access_token', {
    type: 'apiKey',
    in: 'cookie',
    name: 'access_token',
    description: 'Ingresa tu token JWT si deseas probarlo manualmente',
  })
  .build()
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
