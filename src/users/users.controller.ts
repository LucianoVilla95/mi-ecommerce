import { Controller, Post,Get, Put, Delete, Body, UseGuards, Query } from '@nestjs/common';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { UsersCredentialsDto } from './dtos/usersCredentialsDto.dto';
import { AuthResponseDto } from './dtos/authResponse.dto';
import { JwtAuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/currentUser.decorator';
import type { JwtPayload } from './interfaces/jwtPayload.interface';
import { Roles } from '../decorators/rolesUser.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { UsersQueryDto } from './dtos/usersQueryDto.dto';

@Controller('users')
export class UsersController {
  constructor (private readonly usersService: UsersService) {}

  @Post('signup')
  async signUp(@Body() body: UsersBodyDto): Promise<Omit<User, 'password'>> {
    return await this.usersService.signUp(body);
  }

  @Post('signin')
  async signIn(@Body() body: UsersCredentialsDto): Promise<AuthResponseDto> {
    return await this.usersService.signIn(body);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async getUsers(@Query() query: UsersQueryDto) {
    return this.usersService.getUsers(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: JwtPayload): Promise<Omit<User, 'password'>| null> {
    return await this.usersService.getUserById(user.sub);
  }
}