import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Post } from './post.entity';

@Entity('wp_users')
export class User {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_login', type: 'varchar', length: 60, unique: true })
  userLogin: string;

  @Column({ name: 'user_pass', type: 'varchar', length: 255 })
  userPass: string;

  @Column({ name: 'user_nicename', type: 'varchar', length: 50 })
  userNicename: string;

  @Column({ name: 'user_email', type: 'varchar', length: 100, unique: true })
  userEmail: string;

  @Column({ name: 'user_url', type: 'varchar', length: 100, default: '' })
  userUrl: string;

  @CreateDateColumn({ name: 'user_registered', type: 'datetime' })
  userRegistered: Date;

  @Column({ name: 'user_activation_key', type: 'varchar', length: 255, default: '' })
  userActivationKey: string;

  @Column({ name: 'user_status', type: 'int', default: 0 })
  userStatus: number;

  @Column({ name: 'display_name', type: 'varchar', length: 250 })
  displayName: string;

  @Column({ name: 'require_password_change', type: 'boolean', default: false })
  requirePasswordChange: boolean;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}

