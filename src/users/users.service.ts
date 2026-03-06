import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor (private readonly usersRepository: UsersRepository) {}

  async createUser({name, email, password, phone, country, address, city}: UsersBodyDto): Promise<User>  {
    return await this.usersRepository.createUser({name, email, password, phone, country, address, city});
  }
}