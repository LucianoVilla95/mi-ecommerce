import { Injectable, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';
import { UserInfo } from 'os';

@Injectable()
export class UsersService {
  constructor (private readonly usersRepository: UsersRepository) {}

  async signUp({name, email, password, phone, country, address, city}: UsersBodyDto): Promise<Omit<User, 'password'>>  {
    try {
      const userExists: User | null = await this.usersRepository.getUserByEmail(email); 
      if (userExists) {
        throw new ConflictException('Email already registered');
      }
      const hashedPassword: string = await bcrypt.hash(password, 10);
      if (!hashedPassword) {
        throw new BadRequestException('Password could not be hashed');
      }

      return await this.usersRepository.signUp({name, email, password: hashedPassword, phone, country, address, city})

    } catch (error) {

      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Error creating user');
    }


  }
}