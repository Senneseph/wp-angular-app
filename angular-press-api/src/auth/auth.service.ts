import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { userLogin: registerDto.username },
        { userEmail: registerDto.email }
      ]
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      userLogin: registerDto.username,
      userEmail: registerDto.email,
      userPass: hashedPassword,
      displayName: registerDto.displayName,
      userNicename: registerDto.username.toLowerCase().replace(/\s+/g, '-'),
      userUrl: '',
      userStatus: 0,
    });

    await this.userRepository.save(user);

    // Generate JWT token
    const payload = { sub: user.id, username: user.userLogin, email: user.userEmail };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        username: user.userLogin,
        email: user.userEmail,
        displayName: user.displayName,
      }
    };
  }

  async login(loginDto: LoginDto) {
    // Find user by username
    const user = await this.userRepository.findOne({
      where: { userLogin: loginDto.username }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.userPass);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      username: user.userLogin,
      email: user.userEmail,
      requirePasswordChange: user.requirePasswordChange || false
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        username: user.userLogin,
        email: user.userEmail,
        displayName: user.displayName,
        requirePasswordChange: user.requirePasswordChange || false
      }
    };
  }

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      username: user.userLogin,
      email: user.userEmail,
      displayName: user.displayName,
    };
  }

  async changePassword(userId: number, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear password change requirement
    user.userPass = hashedPassword;
    user.requirePasswordChange = false;

    await this.userRepository.save(user);

    // Generate new JWT token with updated requirePasswordChange flag
    const payload = {
      sub: user.id,
      username: user.userLogin,
      email: user.userEmail,
      requirePasswordChange: false
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      message: 'Password changed successfully'
    };
  }
}

