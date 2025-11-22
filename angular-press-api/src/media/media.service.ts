import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(createMediaDto: CreateMediaDto, userId: number) {
    const media = this.postRepository.create({
      postTitle: createMediaDto.title,
      postContent: '',
      postExcerpt: createMediaDto.alt || '',
      postStatus: 'inherit',
      postName: createMediaDto.filename,
      postAuthor: userId,
      guid: createMediaDto.url,
      toPing: '',
      pinged: '',
      postContentFiltered: '',
      postType: 'attachment',
      postMimeType: createMediaDto.mimeType,
    });

    return this.postRepository.save(media);
  }

  async findAll(page: number = 1, limit: number = 10, mimeType?: string) {
    const query = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.postType = :type', { type: 'attachment' })
      .orderBy('post.postDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (mimeType) {
      query.andWhere('post.postMimeType LIKE :mimeType', { mimeType: `${mimeType}%` });
    }

    const [media, total] = await query.getManyAndCount();

    return {
      data: media.map(m => this.transformMedia(m)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const media = await this.postRepository.findOne({
      where: { id, postType: 'attachment' },
      relations: ['author'],
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return this.transformMedia(media);
  }

  async update(id: number, updateMediaDto: UpdateMediaDto, userId: number) {
    const media = await this.postRepository.findOne({ 
      where: { id, postType: 'attachment' } 
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    if (updateMediaDto.title) {
      media.postTitle = updateMediaDto.title;
    }
    if (updateMediaDto.alt !== undefined) {
      media.postExcerpt = updateMediaDto.alt;
    }
    if (updateMediaDto.caption !== undefined) {
      media.postContent = updateMediaDto.caption;
    }

    return this.postRepository.save(media);
  }

  async remove(id: number) {
    const media = await this.postRepository.findOne({ 
      where: { id, postType: 'attachment' } 
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    await this.postRepository.remove(media);
    return { message: 'Media deleted successfully' };
  }

  private transformMedia(media: Post) {
    return {
      id: media.id.toString(),
      title: media.postTitle,
      url: media.guid,
      filename: media.postName,
      alt: media.postExcerpt,
      caption: media.postContent,
      mimeType: media.postMimeType,
      author: media.author ? media.author.displayName : '',
      uploadDate: media.postDate,
      modified: media.postModified,
    };
  }
}

