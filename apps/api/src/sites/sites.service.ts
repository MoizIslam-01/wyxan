import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Person } from '../people/schemas/person.schema.js';
import { validateAddress } from '../common/address.js';
import { prepareSiteContent } from '../common/content.js';
import { CreateSiteDto } from './dto/create-site.dto.js';
import { Site } from './schemas/site.schema.js';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private readonly sites: Model<Site>,
    @InjectModel(Person.name) private readonly people: Model<Person>,
  ) {}

  async findByAddress(rawAddress: string) {
    const address = validateAddress(rawAddress);
    const site = await this.sites
      .findOne({ address })
      .populate('authorId', 'name')
      .lean()
      .exec();
    if (!site) throw new NotFoundException(`No site exists at ${address}`);
    return site;
  }

  async publish(dto: CreateSiteDto) {
    const address = validateAddress(dto.address);
    const authorExists = await this.people.exists({
      _id: new Types.ObjectId(dto.authorId),
    });
    if (!authorExists)
      throw new NotFoundException('Selected author does not exist');
    if (await this.sites.exists({ address })) {
      throw new ConflictException(`A site already exists at ${address}`);
    }

    const content = prepareSiteContent(dto.html);
    const site = await this.sites.create({
      address,
      title: dto.title.trim(),
      authorId: new Types.ObjectId(dto.authorId),
      html: dto.html,
      ...content,
    });
    return site.toObject();
  }

  async search(rawQuery: string) {
    const query = rawQuery.trim();
    if (!query) return [];
    return this.sites
      .find(
        { $text: { $search: query } },
        {
          score: { $meta: 'textScore' },
          address: 1,
          title: 1,
          searchableText: 1,
          authorId: 1,
        },
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(25)
      .populate('authorId', 'name')
      .lean()
      .exec();
  }

}
