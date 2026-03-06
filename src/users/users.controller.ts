import { Controller, Post,Get, Put, Delete, Body } from '@nestjs/common';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';

@Controller('users')
export class UsersController {
  constructor () {}
}