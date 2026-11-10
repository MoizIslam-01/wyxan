import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PersonDocument = HydratedDocument<Person>;

@Schema({ timestamps: true, versionKey: false })
export class Person {
  @Prop({ required: true, unique: true, trim: true, maxlength: 80 })
  name: string;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
