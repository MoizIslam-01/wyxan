import { IsMongoId, IsString, Length, MaxLength } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  @MaxLength(253)
  address: string;

  @IsString()
  @Length(1, 120)
  title: string;

  @IsString()
  @Length(1, 50_000)
  html: string;

  @IsMongoId()
  authorId: string;
}
