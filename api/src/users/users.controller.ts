import { Controller, Post,Get, Patch, Delete, Body, UseGuards, Query, Param, ParseUUIDPipe } from '@nestjs/common';
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
import { UsersUpdateDto } from './dtos/usersUpdateDto.dto';
import { PaginationResult } from './interfaces/paginationMeta.interface';

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
  async getUsers(@Query() query: UsersQueryDto): Promise<PaginationResult<Omit<User, 'password'>>> {
    return this.usersService.getUsers(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: JwtPayload): Promise<Omit<User, 'password'>> {
    return await this.usersService.getUserById(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(@Param('id', new ParseUUIDPipe({ version: '4' })) id:string, @Body() body: UsersUpdateDto): Promise<{message: string}> {
    return await this.usersService.updateUser(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteUser (@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<{message: string}> {
    return await this.usersService.deleteUser(id);
  }
}