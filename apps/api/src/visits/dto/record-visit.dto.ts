import { IsIn, IsMongoId, IsString, MaxLength } from 'class-validator';
import { visitSources } from '../schemas/visit.schema.js';
import type { VisitSource } from '../schemas/visit.schema.js';

export class RecordVisitDto {
  @IsMongoId()
  personId: string;

  @IsString()
  @MaxLength(253)
  address: string;

  @IsIn(visitSources)
  source: VisitSource;
}
