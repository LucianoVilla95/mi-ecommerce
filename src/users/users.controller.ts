import { Controller, Post,Get, Put, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { UsersCredentialsDto } from './dtos/usersCredentialsDto.dto';
import { AuthResponseDto } from './dtos/authResponse.dto';
import { JwtAuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../users/decorators/currentUser.decorator';
import type { JwtPayload } from '../users/interfaces/jwtPayload.interface';

@Controller('users')
export class UsersController {
  constructor (private readonly usersService: UsersService) {}

  @Post('signup')
  async signUp(@Body() {name, email, password, phone, country, address, city}: UsersBodyDto): Promise<Omit<User, 'password'>> {
    return await this.usersService.signUp({name, email, password, phone, country, address, city});
  }

  @Post('signin')
  async signIn(@Body() {email, password}: UsersCredentialsDto): Promise<AuthResponseDto> {
    return await this.usersService.signIn({email, password});
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }
}