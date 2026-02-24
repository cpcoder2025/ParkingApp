import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Parking Application API')
    .setDescription(
      'Complete Parking Management System — Admin Dashboard & Customer Mobile App',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User registration, login, and token management')
    .addTag('Parking', 'Parking location CRUD, nearby search, occupancy, pricing')
    .addTag('Bookings', 'Reservation lifecycle, QR codes, availability')
    .addTag('Payments', 'Stripe payments, invoices, refunds')
    .addTag('Geocoding', 'Forward & reverse geocoding (address ↔ coordinates)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
