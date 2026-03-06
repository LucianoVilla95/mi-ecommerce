import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';

@Injectable()
export class UsersRepository {
  constructor (@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async signUp({name, email, password, phone, country, address, city}: UsersBodyDto): Promise<Omit<User, 'password'>> {
    const user: User = await this.usersRepository.create({name, email, password, phone, country, address, city});
    const result: User = await this.usersRepository.save(user);
    const {password: userPassword, ...userWithoutPassword} = result;
    return userWithoutPassword;
  }
}