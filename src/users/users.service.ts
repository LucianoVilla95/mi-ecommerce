import { Injectable, ConflictException, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';
import { UsersCredentialsDto } from './dtos/usersCredentialsDto.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from './dtos/authResponse.dto';

@Injectable()
export class UsersService {
  constructor (private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService
  ) {}

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

  async signIn({email, password}: UsersCredentialsDto): Promise<AuthResponseDto> {
    try {
      const dbUser: User | null = await this.usersRepository.getUserByEmail(email);

      if (!dbUser) {
        throw new UnauthorizedException('Invalid credentials')
      }

      const isPasswordValid: boolean = await bcrypt.compare(password, dbUser.password)

      if(!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const userPayload = {
        sub: dbUser.id,
        email: dbUser.email
      }

      const token: string = await this.jwtService.sign(userPayload); 

      const {password: userPassword, ...userWithoutPassword} = dbUser;

      return {user: userWithoutPassword, access_token: token};

    } catch (error) {

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException('Login error');
    }   
  }
}