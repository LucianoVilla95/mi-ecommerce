import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';

@Injectable()
export class UsersRepository {
  constructor (@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async createUser({name, email, password, phone, country, address, city}: UsersBodyDto): Promise<User> {
    const user: User = await this.usersRepository.create({name, email, password, phone, country, address, city});
    const result: User = await this.usersRepository.save(user);
    return result;
  }
}