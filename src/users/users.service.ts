import { Injectable, ConflictException, BadRequestException, InternalServerErrorException, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';
import { UsersCredentialsDto } from './dtos/usersCredentialsDto.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from './dtos/authResponse.dto';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { UsersQueryDto } from './dtos/usersQueryDto.dto';
import { PaginationResult } from './interfaces/paginationMeta.interface';
import { UserRole } from './enums/userRole.enum';

@Injectable()
export class UsersService {
  constructor (private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService
  ) {}

  async signUp({name, email, password, phone, country, address, city, role = UserRole.USER}: UsersBodyDto): Promise<Omit<User, 'password'>>  {
    try {
      const userExists: User | null = await this.usersRepository.getUserByEmail(email);
      
      if (userExists) throw new ConflictException('Email already registered');

      const hashedPassword: string = await bcrypt.hash(password, 10);

      if (!hashedPassword) throw new BadRequestException('Password could not be hashed');

      return await this.usersRepository.signUp({name, email, password: hashedPassword, phone, country, address, city, role})

    } catch (error) {

      if (error instanceof ConflictException || error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Error creating user');
    }
  }

  async signIn({email, password}: UsersCredentialsDto): Promise<AuthResponseDto> {
    try {
      const dbUser: User | null = await this.usersRepository.getUserByEmail(email);

      if (!dbUser) throw new UnauthorizedException('Invalid credentials')

      const isPasswordValid: boolean = await bcrypt.compare(password, dbUser.password)

      if(!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

      const userPayload: JwtPayload = {
        sub: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        isBlocked: dbUser.isBlocked,
        isDeleted: dbUser.isDeleted
      }

      const token: string = await this.jwtService.sign(userPayload); 

      const {password: userPassword, ...userWithoutPassword} = dbUser;

      return {user: userWithoutPassword, access_token: token};

    } catch (error) {

      if (error instanceof UnauthorizedException) throw error;

      throw new InternalServerErrorException('Login error');
    }   
  }

  async getUsers({page, limit}: UsersQueryDto): Promise<PaginationResult<Omit<User, 'password'>>> {
    const currentPage: number = page && page > 0 ? page : 1;
    const pageSize: number = limit && limit > 0 ? Math.min(limit, 100) : 10;
    const skip: number = (currentPage - 1) * pageSize;
    
    try{
      const result: [User[], number] = await this.usersRepository.getUsers(pageSize, skip);

      const data: Omit<User, 'password'>[] = result[0].map(user => {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          country: user.country,
          address: user.address,
          city: user.city,
          role: user.role,
          isBlocked: user.isBlocked,
          isDeleted: user.isDeleted
        }
      });
      
      return {
        data: data,
        meta: {
          total: result[1],
          currentPage,
          lastPage: Math.ceil(result[1] / pageSize)
        }
      }

    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Could not get users at this time');
    }
  }

  async getUserById(id: string): Promise<Omit<User, 'password'>| null> {
    const user: Omit<User, 'password'> | null = await this.usersRepository.getUserById(id);
    
    if (!user) throw new NotFoundException(`User with ${id} not found`);

    return user;
  }

  async deleteUser(id: string): Promise<{message: string}> {

    const user: Omit<User, 'password'> | null = await this.usersRepository.getUserById(id);

    if (!user) throw new NotFoundException('User not found');

    return await this.usersRepository.deleteUser(id);

  }


}