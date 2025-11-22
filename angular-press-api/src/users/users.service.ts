import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { userLogin: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      userLogin: createUserDto.username,
      userPass: hashedPassword,
      userNicename: createUserDto.username.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      userEmail: createUserDto.email,
      displayName: createUserDto.displayName || createUserDto.username,
      userUrl: '',
      userActivationKey: '',
      userStatus: 0,
      requiresPasswordChange: false,
    });

    const savedUser = await this.userRepository.save(user);
    return this.transformUser(savedUser);
  }

  async findAll(page: number = 1, limit: number = 10, role?: string) {
    const query = this.userRepository.createQueryBuilder('user')
      .orderBy('user.userRegistered', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await query.getManyAndCount();

    return {
      data: users.map(u => this.transformUser(u)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.transformUser(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email) {
      user.userEmail = updateUserDto.email;
    }
    if (updateUserDto.displayName) {
      user.displayName = updateUserDto.displayName;
    }
    if (updateUserDto.password) {
      user.userPass = await bcrypt.hash(updateUserDto.password, 10);
    }

    const savedUser = await this.userRepository.save(user);
    return this.transformUser(savedUser);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  private transformUser(user: User) {
    return {
      id: user.id.toString(),
      username: user.userLogin,
      email: user.userEmail,
      displayName: user.displayName,
      registered: user.userRegistered,
      role: 'administrator', // Simplified for now
    };
  }
}

