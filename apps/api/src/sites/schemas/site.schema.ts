import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Person } from '../../people/schemas/person.schema.js';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ timestamps: true, versionKey: false })
export class Site {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  address: string;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title: string;

  @Prop({ required: true, type: Types.ObjectId, ref: Person.name })
  authorId: Types.ObjectId;

  @Prop({ required: true, maxlength: 50_000 })
  html: string;

  @Prop({ required: true, maxlength: 50_000 })
  safeHtml: string;

  @Prop({ required: true })
  searchableText: string;
}

export const SiteSchema = SchemaFactory.createForClass(Site);
SiteSchema.index({ title: 'text', searchableText: 'text' });
