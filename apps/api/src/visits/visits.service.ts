import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { validateAddress } from '../common/address.js';
import { Person } from '../people/schemas/person.schema.js';
import { Site } from '../sites/schemas/site.schema.js';
import { HistoryQueryDto } from './dto/history-query.dto.js';
import { RecordVisitDto } from './dto/record-visit.dto.js';
import { Visit } from './schemas/visit.schema.js';

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name) private readonly visits: Model<Visit>,
    @InjectModel(Person.name) private readonly people: Model<Person>,
    @InjectModel(Site.name) private readonly sites: Model<Site>,
  ) {}

  async record(dto: RecordVisitDto) {
    const personId = new Types.ObjectId(dto.personId);
    if (!(await this.people.exists({ _id: personId }))) {
      throw new NotFoundException('Selected person does not exist');
    }

    const address = validateAddress(dto.address);
    const site = await this.sites.findOne({ address }).lean().exec();
    const visit = await this.visits.create({
      personId,
      address,
      siteId: site?._id ?? null,
      status: site ? 'found' : 'not-found',
      source: dto.source,
      titleSnapshot: site?.title ?? null,
      htmlSnapshot: site?.safeHtml ?? null,
    });
    return visit.toObject();
  }

  async history(personIdValue: string, query: HistoryQueryDto) {
    if (!Types.ObjectId.isValid(personIdValue)) {
      throw new NotFoundException('Selected person does not exist');
    }
    const personId = new Types.ObjectId(personIdValue);
    if (!(await this.people.exists({ _id: personId }))) {
      throw new NotFoundException('Selected person does not exist');
    }
    return this.visits
      .find({ personId })
      .sort({ visitedAt: -1 })
      .limit(query.limit)
      .lean()
      .exec();
  }
}
