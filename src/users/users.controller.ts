import { Controller, Post,Get, Put, Delete, Body } from '@nestjs/common';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';
import { UsersService } from './users.service';
import { User } from './users.entity';

@Controller('users')
export class UsersController {
  constructor (private readonly usersService: UsersService) {}

  @Post('signup')
  async signUp(@Body() {name, email, password, phone, country, address, city}: UsersBodyDto): Promise<Omit<User, 'password'>> {
    return await this.usersService.signUp({name, email, password, phone, country, address, city});
  }
}