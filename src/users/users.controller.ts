import { Controller, Post,Get, Put, Delete, Body } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor () {}

  @Post()
  async createUser(@Body() {name, email, password, phone, country, address, city}) {

  }
}