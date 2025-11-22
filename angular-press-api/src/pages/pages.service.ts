import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(createPageDto: CreatePageDto, userId: number) {
    const slug = createPageDto.slug || this.generateSlug(createPageDto.title);
    
    const page = this.postRepository.create({
      postTitle: createPageDto.title,
      postContent: createPageDto.content,
      postExcerpt: createPageDto.excerpt || '',
      postStatus: createPageDto.status || 'draft',
      postName: slug,
      postAuthor: userId,
      guid: '',
      toPing: '',
      pinged: '',
      postContentFiltered: '',
      postType: 'page',
      postParent: createPageDto.parentId || 0,
    });

    return this.postRepository.save(page);
  }

  async findAll(page: number = 1, limit: number = 10, status?: string) {
    const query = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.postType = :type', { type: 'page' })
      .orderBy('post.postDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      query.andWhere('post.postStatus = :status', { status });
    }

    const [pages, total] = await query.getManyAndCount();

    return {
      data: pages.map(p => this.transformPage(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const page = await this.postRepository.findOne({
      where: { id, postType: 'page' },
      relations: ['author'],
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    return this.transformPage(page);
  }

  async update(id: number, updatePageDto: UpdatePageDto, userId: number) {
    const page = await this.postRepository.findOne({ 
      where: { id, postType: 'page' } 
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    if (updatePageDto.title) {
      page.postTitle = updatePageDto.title;
    }
    if (updatePageDto.content) {
      page.postContent = updatePageDto.content;
    }
    if (updatePageDto.excerpt !== undefined) {
      page.postExcerpt = updatePageDto.excerpt;
    }
    if (updatePageDto.status) {
      page.postStatus = updatePageDto.status;
    }
    if (updatePageDto.slug) {
      page.postName = updatePageDto.slug;
    }
    if (updatePageDto.parentId !== undefined) {
      page.postParent = updatePageDto.parentId;
    }

    return this.postRepository.save(page);
  }

  async remove(id: number) {
    const page = await this.postRepository.findOne({ 
      where: { id, postType: 'page' } 
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    await this.postRepository.remove(page);
    return { message: 'Page deleted successfully' };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private transformPage(page: Post) {
    return {
      id: page.id.toString(),
      title: page.postTitle,
      content: page.postContent,
      excerpt: page.postExcerpt,
      author: page.author ? page.author.displayName : '',
      status: page.postStatus as 'draft' | 'published',
      publishDate: page.postDate,
      slug: page.postName,
      type: 'page' as const,
      modified: page.postModified,
      parentId: page.postParent,
    };
  }
}

