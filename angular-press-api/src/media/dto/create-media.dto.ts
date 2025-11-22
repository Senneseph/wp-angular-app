import { IsString, IsOptional } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  title: string;

  @IsString()
  filename: string;

  @IsString()
  url: string;

  @IsString()
  mimeType: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsString()
  caption?: string;
}

