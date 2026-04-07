import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // CORS - Support multiple origins
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174']

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  })

  // Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Manapro API')
    .setDescription('API untuk aplikasi manajemen proyek UMKM Indonesia')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`Server running on http://localhost:${port}`)
  console.log(`Swagger docs at http://localhost:${port}/api`)
}
bootstrap()
