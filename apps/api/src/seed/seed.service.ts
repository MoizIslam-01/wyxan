import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { prepareSiteContent } from '../common/content.js';
import { Person } from '../people/schemas/person.schema.js';
import { Site } from '../sites/schemas/site.schema.js';
import { Visit, VisitSource } from '../visits/schemas/visit.schema.js';
import { historySeed, peopleSeed, sitesSeed } from './seed-data.js';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Person.name) private readonly people: Model<Person>,
    @InjectModel(Site.name) private readonly sites: Model<Site>,
    @InjectModel(Visit.name) private readonly visits: Model<Visit>,
  ) {}

  async run() {
    await this.people.bulkWrite(
      peopleSeed.map((person) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(person.id) },
          update: { $set: { name: person.name } },
          upsert: true,
        },
      })),
    );

    await this.sites.bulkWrite(
      sitesSeed.map((site) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(site.id) },
          update: {
            $set: {
              address: site.address,
              title: site.title,
              authorId: new Types.ObjectId(site.authorId),
              html: site.html,
              ...prepareSiteContent(site.html),
            },
          },
          upsert: true,
        },
      })),
    );

    const sitesByAddress = new Map(
      (await this.sites.find().lean().exec()).map((site) => [
        site.address,
        site,
      ]),
    );
    const start = Date.parse('2026-11-06T09:00:00.000Z');
    const operations = historySeed.flatMap((trail, personIndex) =>
      trail.addresses.map((address, visitIndex) => {
        const site = sitesByAddress.get(address);
        const source: VisitSource = visitIndex === 0 ? 'typed' : 'link';
        const seedKey = `${trail.personId}-${visitIndex}`;
        return {
          updateOne: {
            filter: { seedKey },
            update: {
              $set: {
                personId: new Types.ObjectId(trail.personId),
                address,
                siteId: site?._id ?? null,
                status: site ? ('found' as const) : ('not-found' as const),
                source,
                titleSnapshot: site?.title ?? null,
                htmlSnapshot: site?.safeHtml ?? null,
                visitedAt: new Date(
                  start + personIndex * 60_000 + visitIndex * 6 * 60_000,
                ),
                seedKey,
              },
            },
            upsert: true,
          },
        };
      }),
    );
    await this.visits.bulkWrite(operations);

    return {
      people: await this.people.countDocuments(),
      sites: await this.sites.countDocuments(),
      seededVisits: await this.visits.countDocuments({
        seedKey: { $exists: true },
      }),
    };
  }
}
