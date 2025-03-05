import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { homedir } from 'os';
import { MemoryLocker, Server } from '@tus/server';
import * as express from 'express';
import { FileStore } from '@tus/file-store';

async function bootstrap() {
  const listenPort = 3002;
  global.directories = {
    public: join(homedir(), '/nimkatiha/public'),
    private: join(homedir(), '/nimkatiha/private'),
  };
  global.directories = {
    ...global.directories,
    profileImageSlider: join(global.directories.public, 'profile-image-sliders'),
    uploadedDocuments: (userId) => {
      return join(global.directories.public, 'uploaded-documents', userId);
    },
    excelBackup: () => {
      return join(global.directories.public, 'excel-backup');
    },
  };

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  app.enableCors({
    allowedHeaders: '*',
  });
  app.useGlobalPipes(new ValidationPipe());

  const server = new Server({
    datastore: new FileStore({
      directory: global.directories.private,
    }),
    path: '/uploads',

  });
  const uploadApp = express();
  uploadApp.all('*', server.handle.bind(server));
  app.use('/uploads', uploadApp);
  const config = new DocumentBuilder()
    .setTitle('Nimkatiha-project')
    .setDescription('The Nimkatiha project backend')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);
  await app.listen(listenPort);
}

bootstrap();
