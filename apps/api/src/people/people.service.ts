import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person } from './schemas/person.schema.js';

@Injectable()
export class PeopleService {
  constructor(
    @InjectModel(Person.name) private readonly people: Model<Person>,
  ) {}

  list() {
    return this.people.find().sort({ name: 1 }).lean().exec();
  }
}
