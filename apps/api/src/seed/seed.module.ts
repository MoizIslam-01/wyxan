import { Module } from '@nestjs/common';
import { PeopleModule } from '../people/people.module.js';
import { SitesModule } from '../sites/sites.module.js';
import { VisitsModule } from '../visits/visits.module.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [PeopleModule, SitesModule, VisitsModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
