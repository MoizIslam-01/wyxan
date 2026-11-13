import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Person } from '../../people/schemas/person.schema.js';
import { Site } from '../../sites/schemas/site.schema.js';

export type VisitDocument = HydratedDocument<Visit>;
export const visitSources = [
  'typed',
  'link',
  'search',
  'history',
  'back',
  'forward',
] as const;
export type VisitSource = (typeof visitSources)[number];

@Schema({
  timestamps: { createdAt: 'visitedAt', updatedAt: false },
  versionKey: false,
})
export class Visit {
  @Prop({ required: true, type: Types.ObjectId, ref: Person.name, index: true })
  personId: Types.ObjectId;

  @Prop({ required: true })
  address: string;

  @Prop({ type: Types.ObjectId, ref: Site.name, default: null })
  siteId: Types.ObjectId | null;

  @Prop({ type: String, required: true, enum: ['found', 'not-found'] })
  status: 'found' | 'not-found';

  @Prop({ type: String, required: true, enum: visitSources })
  source: VisitSource;

  @Prop({ type: String, default: null })
  titleSnapshot: string | null;

  @Prop({ type: String, default: null })
  htmlSnapshot: string | null;

  @Prop({ required: false, unique: true, sparse: true })
  seedKey?: string;

  visitedAt: Date;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
VisitSchema.index({ personId: 1, visitedAt: -1 });
