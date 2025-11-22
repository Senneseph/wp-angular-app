import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { Post } from '../entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}

