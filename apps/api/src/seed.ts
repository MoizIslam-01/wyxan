import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SeedService } from './seed/seed.service.js';

const app = await NestFactory.createApplicationContext(AppModule, {
  logger: ['error'],
});

try {
  const result = await app.get(SeedService).run();
  console.log(
    `Seed complete: ${result.people} people, ${result.sites} sites, ${result.seededVisits} visits`,
  );
} finally {
  await app.close();
}
